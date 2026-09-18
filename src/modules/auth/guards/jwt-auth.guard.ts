import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { RedisService } from '../../redis/redis.service.js';
import { I18nContext } from 'nestjs-i18n';


export interface JwtPayload {
  sub: string;
  jti: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
  token: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = this.extractToken(request);
    if (!token) throw this.unauthorized('TOKEN_MISSING');

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw this.unauthorized('TOKEN_INVALID');
    }

    if (await this.redisService.exists(`blacklist:${payload.jti}`)) {
      throw this.unauthorized('TOKEN_INVALID');
    }

    request.user = payload;
    request.token = token;
    return true;
  }

  private extractToken(request: Request): string | undefined {
    const AUTH_SCHEME = 'Token';
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
    return scheme === AUTH_SCHEME ? token : undefined;
  }

  private unauthorized(
    key: 'TOKEN_MISSING' | 'TOKEN_INVALID',
  ): UnauthorizedException {
    const message: string =
      I18nContext.current()?.t(`validation.${key}`) ?? 'is invalid';
    return new UnauthorizedException({ errors: { token: [message] } });
  }
}
