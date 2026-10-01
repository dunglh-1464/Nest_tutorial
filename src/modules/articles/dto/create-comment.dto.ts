import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateCommentDto {
  
  @IsString()
  @IsNotEmpty({ message: i18nValidationMessage('validation.BLANK') })
  body: string;
}

export class RequestCreateCommentDto {
  @ValidateNested()
  @Type(() => CreateCommentDto)
  comment: CreateCommentDto;
}
