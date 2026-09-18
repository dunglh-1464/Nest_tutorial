import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class RegisterUserDto {
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.BLANK') })
  username: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: i18nValidationMessage('validation.INVALID_EMAIL') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.BLANK') })
  email: string;

  @MinLength(8, { message: i18nValidationMessage('validation.MIN_LENGTH') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.BLANK') })
  password: string;
}

export class RegisterDto {
  @ValidateNested()
  @Type(() => RegisterUserDto)
  user: RegisterUserDto;
}
