import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { I18nContext } from 'nestjs-i18n';
import { randomUUID } from 'node:crypto';
import { QueryFailedError } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { CreateUserData, UsersService } from '../users/users.service.js';
import { RegisterUserDto } from './dto/register.dto.js';
import { LoginUserDto } from './dto/login.dto.js';
import { RedisService } from '../redis/redis.service.js';
import { JwtPayload } from './guards/jwt-auth.guard.js';
import { POSTGRES_UNIQUE_VIOLATION_CODE } from './auth.constant.js';
import { UpdateUserDto } from '../users/dto/update-user.dto.js';
import { AttachmentsService } from '../attachments/attachments.service.js';

type UniqueField = 'email' | 'username';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly attachmentsService: AttachmentsService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async register(dto: RegisterUserDto) {
    const [existingEmail, existingUsername] = await Promise.all([
      this.usersService.findByEmail(dto.email),
      this.usersService.findByUserName(dto.username),
    ]);

    if (existingEmail) {
      throw this.alreadyTaken('email');
    }

    if (existingUsername) {
      throw this.alreadyTaken('username');
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.createUser({
      username: dto.username,
      email: dto.email,
      passwordHash,
    });
    const token = await this.signToken(user);
    return this.buildUserResponse(user, token);
  }

  private async createUser(data: CreateUserData): Promise<User> {
    try {
      return await this.usersService.create(data);
    } catch (error) {
      const driverError =
        error instanceof QueryFailedError
          ? (error.driverError as { code?: string; detail?: string })
          : undefined;
      if (driverError?.code === POSTGRES_UNIQUE_VIOLATION_CODE) {
        // Postgres names the column in `detail`: `Key (email)=(...) already exists.`
        const column = driverError.detail?.match(/Key \((\w+)\)/)?.[1];
        throw this.alreadyTaken(column === 'username' ? 'username' : 'email');
      }
      this.logger.error({
        message: 'Failed to create user',
        operation: 'createUser',
        sqlstate: driverError?.code ?? 'unknown',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  private alreadyTaken(field: UniqueField): ConflictException {
    const message: string =
      I18nContext.current()?.t('validation.TAKEN') ?? 'has already been taken';
    // Passing an object makes Nest send it verbatim as the response body.
    return new ConflictException({ errors: { [field]: [message] } });
  }

  private signToken(user: User): Promise<string> {
    return this.jwtService.signAsync({ sub: user.id }, { jwtid: randomUUID() });
  }

  private buildUserResponse(user: User, token: string) {
    return {
      user: {
        email: user.email,
        token,
        username: user.username,
        bio: user.bio ?? null,
        image: user.image ?? null,
      },
    };
  }

  async login(dto: LoginUserDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw this.unauthorizedException('validation.ACCOUNT_NOT_EXISTS');
    }

    const passwordMatched = await argon2.verify(
      user.passwordHash,
      dto.password,
    );
    if (!passwordMatched) {
      throw this.unauthorizedException('validation.WRONG_EMAIL_PASSWORD');
    }

    const token = await this.signToken(user);
    return this.buildUserResponse(user, token);
  }

  private unauthorizedException(message: string) {
    return new UnauthorizedException({
      errors: {
        credentials: [I18nContext.current()?.t(message)],
      },
    });
  }

  async getCurrentUser(userId: string, token: string) {
    const user = await this.usersService.findByUserId(userId);
    if (!user) {
      throw this.unauthorizedException('validation.ACCOUNT_NOT_EXISTS');
    }
    return this.buildUserResponse(user, token);
  }

  async logout(payload: JwtPayload) {
    const ttlSeconds = payload.exp - Math.floor(Date.now() / 1000);
    if (ttlSeconds <= 0) return;

    await this.redisService.setWithTtl(
      `blacklist:${payload.jti}`,
      '1',
      ttlSeconds,
    );
  }

  async updateUser(
    userId: string,
    dto: UpdateUserDto,
    image: Express.Multer.File | undefined,
    token: string,
  ) {
    const { password, ...fields } = dto;

    const attachment = image
      ? await this.attachmentsService.replaceUserAvatar(userId, image)
      : undefined;

    const user = await this.usersService.update(userId, {
      ...fields,

      ...(password
        ? {
            passwordHash: await argon2.hash(password),
          }
        : {}),

      ...(attachment
        ? {
            image: attachment.url,
          }
        : {}),
    });

    if (!user) {
      throw this.unauthorizedException('validation.ACCOUNT_NOT_EXISTS');
    }

    return this.buildUserResponse(user, token);
  }
}
