import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ListArticlesQueryDto {
  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  favorited?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 20;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number = 0;
}
