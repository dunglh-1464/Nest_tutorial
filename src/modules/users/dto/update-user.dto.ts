import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateUserDto {
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  username?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail(
    {},
    {
      message: i18nValidationMessage('validation.INVALID_EMAIL'),
    },
  )
  email?: string;

  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @MinLength(8, {
    message: i18nValidationMessage('validation.MIN_LENGTH'),
  })
  password?: string;

  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  bio?: string;
}
