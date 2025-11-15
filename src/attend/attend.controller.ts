import { Controller } from '@nestjs/common';
import type { AttendService } from './attend.service';

@Controller('attend')
export class AttendController {
    constructor(private readonly attendService: AttendService) {}
}
