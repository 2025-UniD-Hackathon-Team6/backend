import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthModule } from '@libs/jwt';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const options: JwtModuleOptions = {
          secret: config.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '5m',
            issuer: 'caryou.dev',
          },
        };
        return options;
      },
      inject: [ConfigService],
    }),
    JwtAuthModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
