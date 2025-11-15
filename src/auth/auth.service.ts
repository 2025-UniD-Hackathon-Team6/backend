import { JwtAuthService, JwtPayload } from '@libs/jwt';
import { PrismaService } from '@libs/prisma';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { SignUpDto } from './dto/sign-up-user.dto';
import { hash } from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  async createJwtTokens(userId: number, username: string) {
    const payload: JwtPayload = { userId, username };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: 30 * 60,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: 60 * 60 * 24,
    });

    await this.prisma.jwtToken.upsert({
      where: {
        userId,
      },
      update: {
        userId,
        accessToken,
        refreshToken,
      },
      create: {
        userId,
        accessToken,
        refreshToken,
      },
    });

    return { accessToken, refreshToken };
  }

  async register(signUpDto: SignUpDto) {
    if(signUpDto.name.length == 0 || signUpDto.password.length == 0){
      throw new NotAcceptableException('name or password is empty');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        name: signUpDto.name
      }
    })

    if (user) {
      throw new BadRequestException('already exist')
    }

    const encryptedPassword = await hash(signUpDto.password, {
      timeCost: 2,
      memoryCost: 2 ** 11,
      parallelism: 1,
    });
    return await this.prisma.user.create({
      data: {
        name: signUpDto.name,
        password: encryptedPassword,
      },
    });
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        name: loginUserDto.name,
      },
    });

    if (!user) {
      throw new NotFoundException('user name is not registered');
    }

    const isValidUser = await this.jwtAuthService.isValidUser(
      user,
      loginUserDto.password,
    );
    if (!isValidUser) {
      throw new ForbiddenException('wrong password');
    }

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLogin: new Date(),
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return await this.createJwtTokens(user.id, user.name);
  }

  async logout(userId: number) {
    return await this.prisma.jwtToken.delete({
      where: {
        userId,
      },
    });
  }

  async updateInterests(userId: number, interests: string) {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        interests,
      },
      select: {
        id: true,
        name: true,
        interests: true,
        createTime: true,
        updateTime: true,
      },
    });
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        name: true,
      },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return {
      name: user.name,
    };
  }
}
