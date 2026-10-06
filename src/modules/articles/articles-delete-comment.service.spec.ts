import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { describe, expect, it, vi } from 'vitest';
import { ArticlesService } from './articles.service.js';
import { Article } from './entity/articles.entity.js';
import { Comment } from './entity/comment.entity.js';

describe('ArticlesService.deleteComments', () => {
  const article = { id: 'article-id', slug: 'article-slug' } as Article;
  const comment = {
    id: 'comment-id',
    author: { id: 'author-id' },
  } as Comment;

  function setup(foundArticle: Article | null, foundComment: Comment | null) {
    const commentsRepository = {
      findOne: vi.fn().mockResolvedValue(foundComment),
      remove: vi.fn().mockResolvedValue(foundComment),
    };
    const repository = {
      findOne: vi.fn().mockResolvedValue(foundArticle),
      manager: { getRepository: vi.fn(() => commentsRepository) },
    };
    const service = new ArticlesService(repository as unknown as Repository<Article>);
    return { service, repository, commentsRepository };
  }

  it('deletes only the requested comment from the requested article', async () => {
    const { service, repository, commentsRepository } = setup(article, comment);

    await service.deleteComments('article-slug', 'comment-id', 'author-id');

    expect(repository.findOne).toHaveBeenCalledWith({
      where: { slug: 'article-slug' },
      select: { id: true },
    });
    expect(commentsRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'comment-id', article: { id: 'article-id' } },
      select: { id: true, author: { id: true } },
      relations: { author: true },
    });
    expect(commentsRepository.remove).toHaveBeenCalledWith(comment);
  });

  it('returns 404 when the article does not exist', async () => {
    const { service, repository } = setup(null, comment);

    await expect(service.deleteComments('missing', 'comment-id', 'author-id'))
      .rejects.toBeInstanceOf(NotFoundException);
    expect(repository.manager.getRepository).not.toHaveBeenCalled();
  });

  it('returns 404 when the comment is not in the article', async () => {
    const { service, commentsRepository } = setup(article, null);

    await expect(service.deleteComments('article-slug', 'other-id', 'author-id'))
      .rejects.toBeInstanceOf(NotFoundException);
    expect(commentsRepository.remove).not.toHaveBeenCalled();
  });

  it('returns 403 when another user owns the comment', async () => {
    const { service, commentsRepository } = setup(article, comment);

    await expect(service.deleteComments('article-slug', 'comment-id', 'viewer-id'))
      .rejects.toBeInstanceOf(ForbiddenException);
    expect(commentsRepository.remove).not.toHaveBeenCalled();
  });
});
