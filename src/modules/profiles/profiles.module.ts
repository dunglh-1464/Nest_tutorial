import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service.js';
import { ProfilesController } from './profiles.controller.js';
import { Follow } from './entity/follow.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService],
  imports: [TypeOrmModule.forFeature([Follow, User]), AuthModule],
})
export class ProfilesModule {}
