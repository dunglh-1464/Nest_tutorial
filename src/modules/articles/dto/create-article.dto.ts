import { Transform, Type } from 'class-transformer';
import {
    IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Tag } from '../entity/tags.entity.js';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty({ message: i18nValidationMessage('validation.BLANK') })
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty({ message: i18nValidationMessage('validation.BLANK') })
  description: string;

  @IsString()
  @IsNotEmpty({ message: i18nValidationMessage('validation.BLANK') })
  body: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagList: string[];
}

export class RequestCreateArticleDto {
  @ValidateNested()
  @Type(() => CreateArticleDto)
  article: CreateArticleDto;
}
