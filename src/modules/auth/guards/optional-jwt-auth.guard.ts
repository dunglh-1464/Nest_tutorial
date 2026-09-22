import { ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Injectable()
export class OptionalJwtAuthGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    if (request.headers.authorization === undefined) {
      return true;
    }

    return super.canActivate(context);
  }
}
