import {Controller, Get, Query} from '@nestjs/common';
import {ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {I18n, I18nContext} from 'nestjs-i18n';
import {HelloQueryDto} from './dto/hello-query.dto.js';

@ApiTags('hello')
@Controller('hello')
export class HelloController {
  /**
   * Greet the caller in the language they asked for.
   *
   * The language is chosen by the resolvers declared in AppModule, in order: the
   * `?lang=` query parameter, the `x-lang` header, then `Accept-Language`. When
   * none of them match, it falls back to `fallbackLanguage` ('en').
   */
  @Get()
  @ApiOkResponse({schema: {example: {message: 'Xin chào, Dung!'}}})
  getHello(
    @Query() query: HelloQueryDto,
    @I18n() i18n: I18nContext,
  ): {message: string} {
    const message = i18n.t('common.hello', {args: {name: query.name}});
    return {message};
  }
}
