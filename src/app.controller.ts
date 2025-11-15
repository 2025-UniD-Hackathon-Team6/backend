import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('기본')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Hello World', description: '기본 엔드포인트' })
  @ApiResponse({ status: 200, description: '성공', type: String })
  getHello(): string {
    return this.appService.getHello();
  }
}
