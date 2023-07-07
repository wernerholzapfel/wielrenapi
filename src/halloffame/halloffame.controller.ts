
import {Body, Controller, Get, Logger, Param, Post, Req} from '@nestjs/common';
import { Halloffame } from './halloffame.entity';
import { HalloffameService } from './halloffame.service';

@Controller('halloffame')
export class HalloffameController {
    private readonly logger = new Logger('HalloffameController', true);

    constructor(private readonly halloffameService: HalloffameService) {
    }

    @Get()
    async findAll(): Promise<Halloffame[]> {
        return this.halloffameService.findAll();
    }
}