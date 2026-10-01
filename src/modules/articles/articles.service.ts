import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto.js';
import { UpdateArticleDto } from './dto/update-article.dto.js';
import { Article } from './entity/articles.entity.js';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './entity/tags.entity.js';
import { randomUUID } from 'crypto';
import { ResponseArticleDto } from './dto/response-article.dto.js';
import { Follow } from '../profiles/entity/follow.entity.js';
import { User } from '../users/entities/user.entity.js';
import { I18nContext } from 'nestjs-i18n';
import { ListArticlesQueryDto } from './dto/list-articles-query.dto.js';
import { FeedArticlesQueryDto } from './dto/feed-articles-query.dto.js';
import { Comment } from './entity/comment.entity.js';
import {
  ResponseCommentDto,
  ResponseMultipleCommentsDto,
} from './dto/response-comment.dto.js';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
  ) {}

  createNewSlug(slug: string): string {
    return (
      slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') +
      '-' +
      randomUUID()
    );
  }
  async createArticle(
    createArticleDto: CreateArticleDto,
    userId: string,
  ): Promise<ResponseArticleDto> {
    const names = [...new Set(createArticleDto.tagList ?? [])];
    const { savedArticle, tags } =
      await this.articlesRepository.manager.transaction(async (em) => {
        if (names.length > 0) {
          await em
            .createQueryBuilder()
            .insert()
            .into(Tag)
            .values(names.map((name) => ({ name })))
            .orIgnore()
            .execute();
        }

        const tags =
          names.length > 0
            ? await em.find(Tag, { where: { name: In(names) } })
            : [];
        const article = em.create(Article, {
          title: createArticleDto.title,
          description: createArticleDto.description,
          body: createArticleDto.body,
          slug: this.createNewSlug(createArticleDto.title),
          author: { id: userId },
          tags,
        });
        const savedArticle = await em.save(article);
        return { savedArticle, tags };
      });
    const articleWithAuthor = await this.articlesRepository.findOneOrFail({
      where: { id: savedArticle.id },
      relations: { author: true },
    });
    const author = articleWithAuthor.author;
    const following = await this.articlesRepository.manager
      .getRepository(Follow)
      .existsBy({
        follower: { id: userId },
        following: { id: author.id },
      });

    return this.buildResponseArticiles(
      articleWithAuthor,
      author,
      tags,
      following,
    );
  }

  findAll() {
    return `This action returns all articles`;
  }

  async getArticle(slug: string) {
    const articleWithAuthor = await this.articlesRepository.findOneOrFail({
      where: {
        slug,
      },
      relations: { author: true, tags: true },
    });
    const author = articleWithAuthor.author;
    return this.buildResponseArticiles(
      articleWithAuthor,
      author,
      articleWithAuthor.tags,
      false,
    );
  }

  buildResponseArticiles(
    savedArticle: Article,
    author: User,
    tags: Tag[],
    following: boolean,
    favorited: boolean = false,
    favoritesCount: number = 0,
  ) {
    return {
      article: {
        slug: savedArticle.slug,
        title: savedArticle.title,
        description: savedArticle.description,
        body: savedArticle.body,
        tagList: tags.map((tag) => tag.name),
        createdAt: savedArticle.createdAt.toISOString(),
        updatedAt: savedArticle.updatedAt.toISOString(),
        favorited: favorited,
        favoritesCount: favoritesCount,
        author: {
          username: author.username,
          bio: author.bio ?? null,
          image: author.image ?? null,
          following,
        },
      },
    };
  }

  async updateArticles(
    slug: string,
    updateArticleDto: UpdateArticleDto,
    currentUserId: string,
  ) {
    const article = await this.articlesRepository.findOne({
      where: {
        slug,
      },
      relations: {
        author: true,
        tags: true,
      },
    });
    if (!article) {
      throw new NotFoundException(
        I18nContext.current()?.t('validation.NOT_ARTICLE'),
      );
    }
    if (article.author.id != currentUserId) {
      throw new ForbiddenException(
        I18nContext.current()?.t('validation.NOT_EDIT_POST'),
      );
    }
    if (
      updateArticleDto.title != null &&
      updateArticleDto.title != article.title
    ) {
      article.title = this.createNewSlug(updateArticleDto.title);
    }
    if (updateArticleDto.description != null) {
      article.description = updateArticleDto.description;
    }

    if (updateArticleDto.body != null) {
      article.body = updateArticleDto.body;
    }

    const savedArticle = await this.articlesRepository.save(article);
    return this.buildResponseArticiles(
      savedArticle,
      savedArticle.author,
      savedArticle.tags,
      false,
    );
  }

  async deleteArticles(slug: string, currentUserId: string) {
    const article = await this.articlesRepository.findOne({
      where: {
        slug,
      },
      relations: {
        author: true,
        tags: true,
      },
    });
    if (!article) {
      throw new NotFoundException(
        I18nContext.current()?.t('validation.NOT_ARTICLE'),
      );
    }

    if (article?.author.id != currentUserId) {
      throw new ForbiddenException(
        I18nContext.current()?.t('validation.NOT_DELETE_POST'),
      );
    }
    await this.articlesRepository.remove(article);
  }

  async favoriArticle(slug: string, currentUserId: string) {
    const article = await this.articlesRepository.findOne({
      where: {
        slug,
      },
      relations: {
        author: true,
        tags: true,
        favoritedBy: true,
      },
    });
    if (!article) {
      throw new NotFoundException(
        I18nContext.current()?.t('validation.NOT_ARTICLE'),
      );
    }
    const favoritedUser = article.favoritedBy.find(
      (user) => user.id == currentUserId,
    );
    if (favoritedUser) {
      throw new ConflictException(
        I18nContext.current()?.t('validation.LIKED_POST'),
      );
    }

    const exitUser = await this.articlesRepository.manager
      .getRepository(User)
      .findOneBy({ id: currentUserId });
    if (!exitUser) {
      throw new NotFoundException(
        I18nContext.current()?.t('validation.PROFILE_NOT_FOUND'),
      );
    }

    await this.articlesRepository
      .createQueryBuilder()
      .relation(Article, 'favoritedBy')
      .of(article.id)
      .add(currentUserId);

    const countResult = await this.articlesRepository
      .createQueryBuilder('article')
      .innerJoin('article.favoritedBy', 'favoriteUser')
      .where('article.id = :articleId', { articleId: article.id })
      .select('COUNT(favoriteUser.id)', 'count')
      .getRawOne<{ count: string }>();
    const favoritesCount = Number(countResult?.count ?? 0);

    const following = await this.articlesRepository.manager
      .getRepository(Follow)
      .existsBy({
        follower: { id: currentUserId },
        following: { id: article.author.id },
      });

    return this.buildResponseArticiles(
      article,
      article.author,
      article.tags,
      following,
      true,
      favoritesCount,
    );
  }

  async unfavoriteArticle(slug: string, currentUserId: string) {
    const article = await this.articlesRepository.findOne({
      where: {
        slug,
      },
      relations: {
        author: true,
        tags: true,
        favoritedBy: true,
      },
    });
    if (!article) {
      throw new NotFoundException(
        I18nContext.current()?.t('validation.NOT_ARTICLE'),
      );
    }
    const favoritedUser = article.favoritedBy.find(
      (user) => user.id == currentUserId,
    );
    if (!favoritedUser) {
      throw new ConflictException(
        I18nContext.current()?.t('validation.NOT_LIKED_POST'),
      );
    }

    await this.articlesRepository
      .createQueryBuilder()
      .relation(Article, 'favoritedBy')
      .of(article.id)
      .remove(currentUserId);

    const updatedArticle = await this.articlesRepository.findOneOrFail({
      where: { id: article.id },
      relations: { favoritedBy: true },
    });

    const following = await this.articlesRepository.manager
      .getRepository(Follow)
      .existsBy({
        follower: { id: currentUserId },
        following: { id: article.author.id },
      });

    return this.buildResponseArticiles(
      article,
      article.author,
      article.tags,
      following,
      false,
      updatedArticle.favoritedBy.length,
    );
  }

  async articlesList(query: ListArticlesQueryDto, currentUserId?: string) {
    const qb = this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.tags', 'tags')
      .leftJoinAndSelect('article.favoritedBy', 'favoriteUsers');

    if (query.author !== undefined) {
      qb.andWhere('author.username = :author', {
        author: query.author,
      });
    }

    if (query.tag !== undefined) {
      // Join riêng để lọc, vẫn giữ đầy đủ tags trong response.
      qb.innerJoin('article.tags', 'filterTag', 'filterTag.name = :tag', {
        tag: query.tag,
      });
    }

    if (query.favorited !== undefined) {
      qb.innerJoin(
        'article.favoritedBy',
        'filterUser',
        'filterUser.username = :username',
        { username: query.favorited },
      );
    }

    const [articles, articlesCount] = await qb
      .orderBy('article.createdAt', 'DESC')
      .addOrderBy('article.id', 'DESC')
      .skip(query.offset)
      .take(query.limit)
      .getManyAndCount();

    const followedAuthorIds = new Set<string>();

    if (currentUserId && articles.length > 0) {
      const authorIds = [...new Set(articles.map((a) => a.author.id))];

      const follows = await this.articlesRepository.manager
        .getRepository(Follow)
        .find({
          where: {
            follower: { id: currentUserId },
            following: { id: In(authorIds) },
          },
          relations: { following: true },
        });

      for (const follow of follows) {
        followedAuthorIds.add(follow.following.id);
      }
    }

    return {
      articles: articles.map((article) => ({
        slug: article.slug,
        title: article.title,
        description: article.description,
        tagList: article.tags.map((tag) => tag.name),
        createdAt: article.createdAt.toISOString(),
        updatedAt: article.updatedAt.toISOString(),
        favorited: article.favoritedBy.some(
          (user) => user.id === currentUserId,
        ),
        favoritesCount: article.favoritedBy.length,
        author: {
          username: article.author.username,
          bio: article.author.bio ?? null,
          image: article.author.image ?? null,
          following: followedAuthorIds.has(article.author.id),
        },
      })),
      articlesCount,
    };
  }

  async feedList(query: FeedArticlesQueryDto, currentUserId?: string) {
    const [articles, articlesCount] = await this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.tags', 'tags')
      .leftJoinAndSelect('article.favoritedBy', 'favoriteUsers')
      .innerJoin(
        Follow,
        'follow',
        'follow.following_id = author.id AND follow.follower_id = :userId',
        { userId: currentUserId },
      )
      .orderBy('article.createdAt', 'DESC')
      .addOrderBy('article.id', 'DESC')
      .skip(query.offset)
      .take(query.limit)
      .getManyAndCount();

    return {
      articles: articles.map((article) => ({
        slug: article.slug,
        title: article.title,
        description: article.description,
        tagList: article.tags.map((tag) => tag.name),
        createdAt: article.createdAt.toISOString(),
        updatedAt: article.updatedAt.toISOString(),
        favorited: article.favoritedBy.some(
          (user) => user.id === currentUserId,
        ),
        favoritesCount: article.favoritedBy.length,
        author: {
          username: article.author.username,
          bio: article.author.bio ?? null,
          image: article.author.image ?? null,
          following: true,
        },
      })),
      articlesCount,
    };
  }

  async createComment(
    slug: string,
    body: string,
    currentUserId: string,
  ): Promise<ResponseCommentDto> {
    const article = await this.articlesRepository.findOneBy({ slug });
    if (!article) {
      throw new NotFoundException(
        I18nContext.current()?.t('validation.NOT_ARTICLE'),
      );
    }
    const commentsRepository = this.articlesRepository.manager.getRepository(Comment);
    const comment = commentsRepository.create({
      body,
      article,
      author: { id: currentUserId },
    });
    const savedComment = await commentsRepository.save(comment);
    const commentWithAuthor = await commentsRepository.findOneOrFail({
      where: { id: savedComment.id },
      relations: { author: true },
    });

    return {
      comment: {
        id: commentWithAuthor.id,
        createdAt: commentWithAuthor.createdAt.toISOString(),
        updatedAt: commentWithAuthor.updatedAt.toISOString(),
        body: commentWithAuthor.body,
        author: {
          username: commentWithAuthor.author.username,
          bio: commentWithAuthor.author.bio ?? null,
          image: commentWithAuthor.author.image ?? null,
          following: false,
        },
      },
    };
  }

  async getComments(
    slug: string,
    currentUserId?: string,
  ): Promise<ResponseMultipleCommentsDto> {
    const article = await this.articlesRepository.findOne({
      where: { slug },
      relations: { comments: { author: true } },
    });
    if (!article) {
      throw new NotFoundException(
        I18nContext.current()?.t('validation.NOT_ARTICLE'),
      );
    }

    const comments = article.comments ?? [];
    const authorIds = [...new Set(comments.map((comment) => comment.author.id))];
    const followedAuthorIds = new Set<string>();

    if (currentUserId && authorIds.length > 0) {
      const follows = await this.articlesRepository.manager
        .getRepository(Follow)
        .find({
          where: {
            follower: { id: currentUserId },
            following: { id: In(authorIds) },
          },
          relations: { following: true },
        });
      follows.forEach((follow) => followedAuthorIds.add(follow.following.id));
    }

    return {
      comments: comments
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((comment) => ({
          id: comment.id,
          createdAt: comment.createdAt.toISOString(),
          updatedAt: comment.updatedAt.toISOString(),
          body: comment.body,
          author: {
            username: comment.author.username,
            bio: comment.author.bio ?? null,
            image: comment.author.image ?? null,
            following: followedAuthorIds.has(comment.author.id),
          },
        })),
    };
  }

  async deleteComments(slug: string, commentId: string, currentId: string) {
    const article = await this.articlesRepository.findOneBy({ slug });
    if (!article) {
      throw new NotFoundException(
        I18nContext.current()?.t('validation.NOT_ARTICLE'),
      );
    }

    const commentsRepository = this.articlesRepository.manager.getRepository(Comment);
    const commentNeedDelete = await commentsRepository.findOne({
      where: { id: commentId, article: { id: article.id } },
      relations: { author: true },
    });
    if (!commentNeedDelete) {
      throw new NotFoundException(
        I18nContext.current()?.t('validation.NO_COMMENT_FOUND'),
      );
    }
    if (commentNeedDelete.author.id !== currentId) {
      throw new ForbiddenException(
        I18nContext.current()?.t('validation.NOT_DELETE_COMMENT'),
      );
    }
    await commentsRepository.remove(commentNeedDelete);
  }
}
