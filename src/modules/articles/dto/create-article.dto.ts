import { Transform, Type } from 'class-transformer';
import {
    IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Tag } from '../entity/tags.entity.js';

export class CreateArticleDto {
  @IsNotEmpty({ message: i18nValidationMessage('validation.BLANK') })
  title: string;

  @IsNotEmpty({ message: i18nValidationMessage('validation.BLANK') })
  description: string;

  @IsNotEmpty({ message: i18nValidationMessage('validation.BLANK') })
  body: string;

  @IsOptional()
  @IsArray()
  @IsString({each: true})
  tagList: string[];
}

export class RequestCreateArticleDto {
  @ValidateNested()
  @Type(() => CreateArticleDto)
  article: CreateArticleDto;
}
