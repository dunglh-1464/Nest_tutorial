import { plainToInstance } from 'class-transformer';
import { describe, expect, it } from 'vitest';
import { CommentsQueryDto } from './comments-query.dto.js';

describe('CommentsQueryDto', () => {
  it('defaults to the first page and transforms query values to numbers', () => {
    const defaults = plainToInstance(CommentsQueryDto, {});
    const query = plainToInstance(CommentsQueryDto, {
      limit: '5',
      offset: '10',
    });

    expect(defaults).toMatchObject({ limit: 20, offset: 0 });
    expect(query).toMatchObject({ limit: 5, offset: 10 });
  });
});
