import { ApiProperty } from '@nestjs/swagger';

export class ArticleAuthorDto {
  @ApiProperty()
  username: string;

  @ApiProperty({ type: String, nullable: true })
  bio: string | null;

  @ApiProperty({ type: String, nullable: true })
  image: string | null;

  @ApiProperty()
  following: boolean;
}

export class ArticleResponseDataDto {
  @ApiProperty()
  slug: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  body: string;

  @ApiProperty({ type: [String] })
  tagList: string[];

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;

  @ApiProperty()
  favorited: boolean;

  @ApiProperty()
  favoritesCount: number;

  @ApiProperty({ type: ArticleAuthorDto })
  author: ArticleAuthorDto;
}

export class ResponseArticleDto {
  @ApiProperty({ type: ArticleResponseDataDto })
  article: ArticleResponseDataDto;
}
