import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service.js';
import { ArticlesController } from './articles.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './entity/articles.entity.js';
import { Tag } from './entity/tags.entity.js';
import { Comment } from './entity/comment.entity.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  controllers: [ArticlesController],
  providers: [ArticlesService],
  imports: [TypeOrmModule.forFeature([Article, Tag, Comment]), AuthModule],
})
export class ArticlesModule {}
