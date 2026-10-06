import { PickType } from '@nestjs/swagger';
import { ListArticlesQueryDto } from './list-articles-query.dto.js';

export class CommentsQueryDto extends PickType(ListArticlesQueryDto, [
  'limit',
  'offset',
] as const) {}
