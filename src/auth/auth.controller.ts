import { Body, Controller, Post, Req, Res, Get, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthNotNeeded, JwtTokens, type AuthenticatedRequest } from '@libs/jwt';
import { type Response } from 'express';
import { REFRESH_TOKEN_COOKIE_OPTIONS } from '@libs/constants';
import { LoginUserDto } from './dto/login-user.dto';
import { SignUpDto } from './dto/sign-up-user.dto';
import { UpdateInterestsDto } from './dto/update-interests.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';

@ApiTags('인증')
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
  @ApiOperation({ summary: '회원가입', description: '새로운 사용자를 등록합니다.' })
  @ApiBody({ type: SignUpDto })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 409, description: '이미 존재하는 사용자' })
  async register(@Body() signUpDto: SignUpDto) {
    return await this.authService.register(signUpDto);
  }

  @AuthNotNeeded()
  @Post('login')
  @ApiOperation({ summary: '로그인', description: '사용자 로그인을 수행합니다.' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: 200, description: '로그인 성공. Authorization 헤더와 refresh_token 쿠키가 설정됩니다.' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const jwtTokens = await this.authService.login(loginUserDto);
    this.setJwtResponse(res, jwtTokens);
  }

  @Post('logout')
  @ApiBearerAuth('access-token')
  @ApiCookieAuth('refresh_token')
  @ApiOperation({ summary: '로그아웃', description: '사용자 로그아웃을 수행합니다.' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
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
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '프로필 조회', description: '현재 로그인한 사용자의 프로필을 조회합니다.' })
  @ApiResponse({ status: 200, description: '프로필 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getProfile(@Req() req: AuthenticatedRequest) {
    return await this.authService.getProfile(req.user.id);
  }

  @Patch('interests')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '관심사 업데이트', description: '사용자의 관심 직군/직무를 업데이트합니다.' })
  @ApiBody({ type: UpdateInterestsDto })
  @ApiResponse({ status: 200, description: '관심사 업데이트 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
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
