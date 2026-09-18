import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class LoginUserDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: i18nValidationMessage('validation.INVALID_EMAIL') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.BLANK') })
  email: string;

  @IsNotEmpty({ message: i18nValidationMessage('validation.BLANK') })
  password: string;
}

export class LoginDto {
  @ValidateNested()
  @Type(() => LoginUserDto)
  user: LoginUserDto;
}
