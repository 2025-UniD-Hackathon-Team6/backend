import { Controller } from '@nestjs/common';

@Controller('job')
export class JobController {
    constructor(private readonly jobController: JobController) {}
}
