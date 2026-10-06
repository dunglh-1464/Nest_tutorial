import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Tag } from './tags.entity.js';
import { Article } from './articles.entity.js';

@Entity('comment')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'body' })
  body: string;

  @ManyToOne(() => Article, (article) => article.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'article_id' })
  article: Relation<Article>;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
