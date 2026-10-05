import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Put,
  Query,
  HttpCode,
} from '@nestjs/common';
import { ArticlesService } from './articles.service.js';
import { RequestCreateArticleDto } from './dto/create-article.dto.js';
import { UpdateRequestArticleDto } from './dto/update-article.dto.js';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ResponseArticleDto } from './dto/response-article.dto.js';
import {
  type AuthenticatedRequest,
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard.js';
import { ListArticlesQueryDto } from './dto/list-articles-query.dto.js';
import { FeedArticlesQueryDto } from './dto/feed-articles-query.dto.js';
import { CommentsQueryDto } from './dto/comments-query.dto.js';
import { RequestCreateCommentDto } from './dto/create-comment.dto.js';
import {
  ResponseCommentDto,
  ResponseMultipleCommentsDto,
} from './dto/response-comment.dto.js';

@Controller()
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post('articles')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: ResponseArticleDto })
  createArticle(
    @Body() requestCreateArticleDto: RequestCreateArticleDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.articlesService.createArticle(
      requestCreateArticleDto.article,
      req.user.sub,
    );
  }

  @Get('articles/feed')
  @UseGuards(JwtAuthGuard)
  feedListl(
    @Query() query: FeedArticlesQueryDto,
    @Req() request: Request & { user?: { sub: string } },
  ) {
    return this.articlesService.feedList(query, request.user?.sub);
  }

  @Get('articles/:slug')
  @ApiCreatedResponse({ type: ResponseArticleDto })
  getArticle(@Param('slug') slug: string) {
    return this.articlesService.getArticle(slug);
  }

  @Put('articles/:slug')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: ResponseArticleDto })
  update(
    @Param('slug') slug: string,
    @Body() updateRequestArticleDto: UpdateRequestArticleDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.articlesService.updateArticles(
      slug,
      updateRequestArticleDto.article,
      req.user.sub,
    );
  }

  @Delete('articles/:slug')
  @UseGuards(JwtAuthGuard)
  @ApiNoContentResponse()
  deleteArticles(
    @Param('slug') slug: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.articlesService.deleteArticles(slug, req.user.sub);
  }

  @Post('articles/:slug/favorite')
  @UseGuards(JwtAuthGuard)
  favoriteArticle(
    @Param('slug') slug: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.articlesService.favoriArticle(slug, req.user.sub);
  }

  @Delete('articles/:slug/favorite')
  @UseGuards(JwtAuthGuard)
  unfavoriteArticle(
    @Param('slug') slug: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.articlesService.unfavoriteArticle(slug, req.user.sub);
  }

  @Get('articles')
  @UseGuards(OptionalJwtAuthGuard)
  articlesList(
    @Query() query: ListArticlesQueryDto,
    @Req() request: Request & { user?: { sub: string } },
  ) {
    return this.articlesService.articlesList(query, request.user?.sub);
  }

  @Post('articles/:slug/comments')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: ResponseCommentDto })
  createComment(
    @Param('slug') slug: string,
    @Body() body: RequestCreateCommentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.articlesService.createComment(
      slug,
      body.comment.body,
      req.user.sub,
    );
  }

  @Get('articles/:slug/comments')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOkResponse({ type: ResponseMultipleCommentsDto })
  getComments(
    @Param('slug') slug: string,
    @Query() query: CommentsQueryDto,
    @Req() request: Request & { user?: { sub: string } },
  ) {
    return this.articlesService.getComments(slug, query, request.user?.sub);
  }

  @Delete('/articles/:slug/comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiNoContentResponse()
  @HttpCode(204)
  deleteComment(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.articlesService.deleteComments(slug, id, req.user.sub);
  }
}
