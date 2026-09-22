import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import {
  type AuthenticatedRequest,
  JwtAuthGuard,
} from './guards/jwt-auth.guard.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { avatarUploadOptions } from '../attachments/avatar-upload.options.js';
import { UpdateUserDto } from '../users/dto/update-user.dto.js';

const USER_RESPONSE_EXAMPLE = {
  user: {
    email: 'jake@jake.jake',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    username: 'jake',
    bio: null,
    image: null,
  },
};
@Controller()
@ApiTags('Users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('users')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({ schema: { example: USER_RESPONSE_EXAMPLE } })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto.user);
  }

  @Post('users/login')
  @ApiOperation({ summary: 'Log in and receive a token' })
  @ApiOkResponse({ schema: { example: USER_RESPONSE_EXAMPLE } })
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.user);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @ApiOkResponse({ schema: { example: USER_RESPONSE_EXAMPLE } })
  getCurrentUser(@Req() req: AuthenticatedRequest) {
    return this.authService.getCurrentUser(req.user.sub, req.token);
  }

  @Post('user/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Invalidate the current token' })
  @ApiNoContentResponse({ description: 'Token blacklisted; no body returned.' })
  logout(@Req() req: AuthenticatedRequest) {
    return this.authService.logout(req.user);
  }

  @Put('user')
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('token')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update current user' })
  @UseInterceptors(FileInterceptor('image', avatarUploadOptions))
  updateUser(
    @Req() request: AuthenticatedRequest,

    @Body()
    dto: UpdateUserDto,

    @UploadedFile(
      new ParseFilePipeBuilder()
        .build({
          fileIsRequired: false,
        }),
    )
    image?: Express.Multer.File,
  ) {
    return this.authService.updateUser(
      request.user.sub,
      dto,
      image,
      request.token,
    );
  }
}
