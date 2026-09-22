import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Follow } from './entity/follow.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Follow)
    private readonly followsRepository: Repository<Follow>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getProfile(username: string, currentUserId: string | undefined) {
    const profileUser = await this.usersRepository.findOne({
      where: {
        username,
      },
    });
    if (!profileUser) {
      throw new NotFoundException(
        I18nContext.current()?.t('validation.PROFILE_NOT_FOUND'),
      );
    }
    let isFollowing = false
    if (currentUserId) {
      const existingFollow = await this.followsRepository.findOne({
        where: {
          follower: {
            id: currentUserId,
          },
          following: {
            id: profileUser.id,
          },
        },
      });
      isFollowing = !!existingFollow;
    }
      return {
        profile: {
          username: profileUser.username,
          bio: profileUser.bio ?? null,
          image: profileUser.image ?? null,
          following: isFollowing,
        },
      };
  }

  async followUser(currentUserId: string, followUserName: string) {
    const existingFollow = await this.followsRepository.findOne({
      where: {
        follower: {
          id: currentUserId,
        },
        following: {
          username: followUserName,
        },
      },
    });

    if (existingFollow) {
      throw new ConflictException(
        I18nContext.current()?.t('validation.FOLLOWED_ME'),
      );
    }

    const targetUser = await this.usersRepository.findOne({
      where: {
        username: followUserName,
      },
    });

    if (!targetUser) {
      throw new NotFoundException(
        I18nContext.current()?.t('validation.PROFILE_NOT_FOUND'),
      );
    }

    const follow = this.followsRepository.create({
      follower: { id: currentUserId } as User,
      following: targetUser,
    });

    await this.followsRepository.save(follow);

    return {
      profile: {
        username: targetUser.username,
        bio: targetUser.bio ?? null,
        image: targetUser.image ?? null,
        following: true,
      },
    };
  }

  async unfollowUser(currentUserId: string, unfollowUserName: string) {
    const existingFollow = await this.followsRepository.findOne({
      where: {
        follower: {
          id: currentUserId,
        },
        following: {
          username: unfollowUserName,
        },
      },
    });

    if (!existingFollow) {
      throw new NotFoundException(
        I18nContext.current()?.t('validation.NOT_FOLLOWING'),
      );
    }

    await this.followsRepository.remove(existingFollow);
    return {
      username: unfollowUserName,
      following: false,
    };
  }
}
