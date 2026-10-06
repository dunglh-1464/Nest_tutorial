import { ApiProperty } from '@nestjs/swagger';
import { ArticleAuthorDto } from './response-article.dto.js';

export class CommentResponseDataDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;

  @ApiProperty()
  body: string;

  @ApiProperty({ type: ArticleAuthorDto })
  author: ArticleAuthorDto;
}

export class ResponseCommentDto {
  @ApiProperty({ type: CommentResponseDataDto })
  comment: CommentResponseDataDto;
}

export class ResponseMultipleCommentsDto {
  @ApiProperty({ type: [CommentResponseDataDto] })
  comments: CommentResponseDataDto[];
}
