
import {Body, Controller, Get, Logger, Param, Post, Req} from '@nestjs/common';
import { CareerService } from './career.service';
import { Career } from './career.entity';

@Controller('career')
export class CareerController {
    private readonly logger = new Logger('CareerController', true);

    constructor(private readonly careerService: CareerService) {
    }

    @Get()
    async findAll(): Promise<Career[]> {
        return this.careerService.findAll();
    }
}