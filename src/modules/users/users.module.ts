import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';

@Module({
  providers: [UsersService],
  exports: [UsersService],
  imports: [TypeOrmModule.forFeature([User])],
})
export class UsersModule {}
