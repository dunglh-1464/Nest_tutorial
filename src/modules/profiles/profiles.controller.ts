import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service.js';
import { ProfileResponseDto } from './dto/profile-response.dto.js';
import { ApiOkResponse } from '@nestjs/swagger';
import {
  type AuthenticatedRequest,
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard.js';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(':username')
  @ApiOkResponse({
    type: ProfileResponseDto,
  })
  @UseGuards(OptionalJwtAuthGuard)
  getProfile(
    @Param('username') username: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.profilesService.getProfile(username, request.user.sub);
  }

  @Post(':username/follow')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    type: ProfileResponseDto,
  })
  followUser(
    @Param('username') username: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.profilesService.followUser(request.user.sub, username);
  }

  @Delete(':username/follow')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ProfileResponseDto })
  unfollowUser(
    @Param('username') username: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.profilesService.unfollowUser(request.user.sub, username);
  }
}
