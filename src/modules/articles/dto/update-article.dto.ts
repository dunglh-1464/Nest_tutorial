import { PartialType, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsObject, ValidateNested } from 'class-validator';
import { CreateArticleDto } from './create-article.dto.js';

export class UpdateArticleDto extends PartialType(
  PickType(CreateArticleDto, ['title', 'description', 'body'] as const),
) {}

export class UpdateRequestArticleDto {
  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateArticleDto)
  article: UpdateArticleDto;
}
