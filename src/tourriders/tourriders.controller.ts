import {Controller} from '@nestjs/common/utils/decorators/controller.decorator';
import {Body, Get, Logger, Post, Req} from '@nestjs/common';
import {TourridersService} from './tourriders.service';
import {Tourriders} from './tourriders.entity';
import {CreateTourridersDto} from './create-tourriders.dto';

@Controller('tourriders')
export class TourridersController {
    private readonly logger = new Logger('TourridersController', true);

    constructor(private readonly tourridersService: TourridersService) {
    }

    @Get()
    async findAll(): Promise<Tourriders[]> {
        return this.tourridersService.findAll();
    }

    @Post()
    async create(@Req() req, @Body() createTourridersDto: CreateTourridersDto) {
        this.logger.log('post tourriders');
        const newTourriders = Object.assign({}, createTourridersDto);
        return await this.tourridersService.create(newTourriders);
    }
}