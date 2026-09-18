import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import {  type AuthenticatedRequest, JwtAuthGuard } from './guards/jwt-auth.guard.js';

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
}
