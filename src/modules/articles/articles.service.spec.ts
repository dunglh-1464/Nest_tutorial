import { Repository } from 'typeorm';
import { describe, expect, it, vi } from 'vitest';
import { ArticlesService } from './articles.service.js';
import { Article } from './entity/articles.entity.js';
import { Tag } from './entity/tags.entity.js';
import { Comment } from './entity/comment.entity.js';
import { NotFoundException } from '@nestjs/common';

describe('ArticlesService.createArticle', () => {
  const author = { id: 'user-id', username: 'jake', bio: null, image: null };
  const createdAt = new Date('2026-09-25T00:00:00.000Z');
  const dto = {
    title: 'A new article',
    description: 'Description',
    body: 'Body',
  };

  function setup(tags: Tag[]) {
    const insert = vi.fn().mockReturnThis();
    const into = vi.fn().mockReturnThis();
    const values = vi.fn().mockReturnThis();
    const orIgnore = vi.fn().mockReturnThis();
    const execute = vi.fn().mockResolvedValue({});
    const builder = { insert, into, values, orIgnore, execute };
    const em = {
      createQueryBuilder: vi.fn(() => builder),
      find: vi.fn().mockResolvedValue(tags),
      create: vi.fn((_type: typeof Article, data: Partial<Article>) => data),
      save: vi.fn(async (article: Article) => ({
        ...article,
        id: 'article-id',
        createdAt,
        updatedAt: createdAt,
      })),
    };
    const followRepository = { existsBy: vi.fn().mockResolvedValue(false) };
    const repository = {
      manager: {
        transaction: vi.fn(async (callback: (manager: typeof em) => Promise<unknown>) =>
          callback(em),
        ),
        getRepository: vi.fn(() => followRepository),
      },
      findOneOrFail: vi.fn(async () => ({
        id: 'article-id',
        slug: 'a-new-article',
        title: dto.title,
        description: dto.description,
        body: dto.body,
        createdAt,
        updatedAt: createdAt,
        author,
      })),
    };

    const service = new ArticlesService(
      repository as unknown as Repository<Article>,
    );
    return { service, repository, em, builder };
  }

  it('inserts unique tag names once and saves the article in the transaction', async () => {
    const tags = [
      { id: 'tag-1', name: 'nestjs' },
      { id: 'tag-2', name: 'typescript' },
    ] as Tag[];
    const { service, repository, em, builder } = setup(tags);

    const result = await service.createArticle(
      { ...dto, tagList: ['nestjs', 'typescript', 'nestjs'] },
      author.id,
    );

    expect(repository.manager.transaction).toHaveBeenCalledOnce();
    expect(builder.values).toHaveBeenCalledWith([
      { name: 'nestjs' },
      { name: 'typescript' },
    ]);
    expect(builder.orIgnore).toHaveBeenCalledOnce();
    expect(em.find).toHaveBeenCalledOnce();
    expect(em.create).toHaveBeenCalledWith(
      Article,
      expect.objectContaining({ tags }),
    );
    expect(em.save).toHaveBeenCalledOnce();
    expect(result.article.tagList).toEqual(['nestjs', 'typescript']);
  });

  it('does not insert or query tags when none were supplied', async () => {
    const { service, em } = setup([]);

    const result = await service.createArticle(
      { ...dto, tagList: [] },
      author.id,
    );

    expect(em.createQueryBuilder).not.toHaveBeenCalled();
    expect(em.find).not.toHaveBeenCalled();
    expect(em.save).toHaveBeenCalledOnce();
    expect(result.article.tagList).toEqual([]);
  });
});

describe('ArticlesService.createComment', () => {
  const createdAt = new Date('2026-10-01T09:00:00.000Z');
  const article = { id: 'article-id', slug: 'article-slug' } as Article;
  const author = {
    id: 'user-id',
    username: 'jake',
    bio: null,
    image: null,
  };

  function setup(foundArticle: Article | null) {
    const commentsRepository = {
      create: vi.fn((data: Partial<Comment>) => data),
      save: vi.fn(async (comment: Partial<Comment>) => ({ ...comment, id: 'comment-id' })),
      findOneOrFail: vi.fn(async () => ({
        id: 'comment-id',
        body: 'Nice article',
        createdAt,
        updatedAt: createdAt,
        author,
      })),
    };
    const repository = {
      findOneBy: vi.fn().mockResolvedValue(foundArticle),
      manager: { getRepository: vi.fn(() => commentsRepository) },
    };
    const service = new ArticlesService(repository as unknown as Repository<Article>);
    return { service, repository, commentsRepository };
  }

  it('saves a comment and returns the Single Comment response', async () => {
    const { service, commentsRepository } = setup(article);

    const result = await service.createComment('article-slug', 'Nice article', 'user-id');

    expect(commentsRepository.create).toHaveBeenCalledWith({
      body: 'Nice article',
      article,
      author: { id: 'user-id' },
    });
    expect(commentsRepository.save).toHaveBeenCalledOnce();
    expect(commentsRepository.findOneOrFail).toHaveBeenCalledWith({
      where: { id: 'comment-id' },
      relations: { author: true },
    });
    expect(result).toEqual({
      comment: {
        id: 'comment-id',
        body: 'Nice article',
        createdAt: createdAt.toISOString(),
        updatedAt: createdAt.toISOString(),
        author: { username: 'jake', bio: null, image: null, following: false },
      },
    });
  });

  it('does not save a comment when the article is missing', async () => {
    const { service, commentsRepository } = setup(null);

    await expect(service.createComment('missing', 'Nice article', 'user-id'))
      .rejects.toBeInstanceOf(NotFoundException);
    expect(commentsRepository.save).not.toHaveBeenCalled();
  });
});
