import {IsNotEmpty, IsOptional, IsString} from 'class-validator';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';

export class HelloQueryDto {
  @ApiProperty({example: 'Dung', description: 'Name of the person to greet'})
  @IsString({message: 'validation.IS_STRING'})
  @IsNotEmpty({message: 'validation.NOT_EMPTY'})
  name!: string;

  /**
   * nestjs-i18n's QueryResolver reads this parameter to select the language.
   * It has to be declared here because ValidationPipe runs with
   * `forbidNonWhitelisted`: any query parameter absent from the DTO is rejected
   * with a 400.
   */
  @ApiPropertyOptional({example: 'vi', description: 'Response language (en | vi)'})
  @IsOptional()
  @IsString({message: 'validation.IS_STRING'})
  lang?: string;
}
