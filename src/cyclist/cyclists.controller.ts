import {Controller} from '@nestjs/common/utils/decorators/controller.decorator';
import {Body, Get, Logger, Post, Req} from '@nestjs/common';
import {CyclistService} from './cyclist.service';
import {Cyclist} from './cyclist.entity';
import {CreateCyclistDto} from './create-cyclist.dto';

@Controller('cyclists')
export class CyclistController {
    private readonly logger = new Logger('CyclistController', true);

    constructor(private readonly cyclistService: CyclistService) {
    }

    @Get()
    async findAll(): Promise<Cyclist[]> {
        return this.cyclistService.findAll();
    }

    @Post()
    async create(@Req() req, @Body() createCyclistDto: CreateCyclistDto) {
        this.logger.log('post cyclist');
        const newCyclist = Object.assign({}, createCyclistDto);
        return await this.cyclistService.create(newCyclist);
    }
}