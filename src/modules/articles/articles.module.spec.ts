import { MODULE_METADATA } from '@nestjs/common/constants';
import { getRepositoryToken } from '@nestjs/typeorm';
import { describe, expect, it } from 'vitest';
import { ArticlesModule } from './articles.module.js';
import { Comment } from './entity/comment.entity.js';

describe('ArticlesModule', () => {
  it('registers the Comment entity for TypeORM auto-loading', () => {
    const imports = Reflect.getMetadata(MODULE_METADATA.IMPORTS, ArticlesModule) as Array<{
      providers?: Array<{ provide?: unknown }>;
    }>;

    const repositoryTokens = imports.flatMap((module) =>
      (module.providers ?? []).map((provider) => provider.provide),
    );

    expect(repositoryTokens).toContain(getRepositoryToken(Comment));
  });
});
