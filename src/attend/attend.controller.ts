import { Controller } from '@nestjs/common';

@Controller('attend')
export class AttendController {
    constructor(private readonly attendController: AttendController) {}
}
