import { Body, Controller, Post, Req, Res, Get, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthNotNeeded, JwtTokens, type AuthenticatedRequest } from '@libs/jwt';
import { type Response } from 'express';
import { REFRESH_TOKEN_COOKIE_OPTIONS } from '@libs/constants';
import { LoginUserDto } from './dto/login-user.dto';
import { SignUpDto } from './dto/sign-up-user.dto';
import { UpdateInterestsDto } from './dto/update-interests.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  setJwtResponse = (res: Response, jwtTokens: JwtTokens) => {
    res.setHeader('authorization', `Bearer ${jwtTokens.accessToken}`);
    res.cookie(
      'refresh_token',
      jwtTokens.refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS,
    );
  };

  @AuthNotNeeded()
  @Post('register')
  async register(@Body() signUpDto: SignUpDto) {
    return await this.authService.register(signUpDto);
  }

  @AuthNotNeeded()
  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const jwtTokens = await this.authService.login(loginUserDto);
    this.setJwtResponse(res, jwtTokens);
  }

  @Post('logout')
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) return;

    await this.authService.logout(req.user.id);
    res.clearCookie('refresh_token', REFRESH_TOKEN_COOKIE_OPTIONS);
  }

  @Get('profile')
  async getProfile(@Req() req: AuthenticatedRequest) {
    return await this.authService.getProfile(req.user.id);
  }

  @Patch('interests')
  async updateInterests(
    @Req() req: AuthenticatedRequest,
    @Body() updateInterestsDto: UpdateInterestsDto,
  ) {
    return await this.authService.updateInterests(
      req.user.id,
      updateInterestsDto.interests,
    );
  }
}
