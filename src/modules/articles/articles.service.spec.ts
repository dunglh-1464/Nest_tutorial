import { Repository } from 'typeorm';
import { describe, expect, it, vi } from 'vitest';
import { ArticlesService } from './articles.service.js';
import { Article } from './entity/articles.entity.js';
import { Tag } from './entity/tags.entity.js';

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
