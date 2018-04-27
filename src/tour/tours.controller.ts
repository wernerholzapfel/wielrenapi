import {Controller} from '@nestjs/common/utils/decorators/controller.decorator';
import {Body, Get, Logger, Param, Post, Req} from '@nestjs/common';
import {TourService} from './tour.service';
import {Tour} from './tour.entity';
import {CreateTourDto} from './create-tour.dto';

@Controller('tours')
export class TourController {
    private readonly logger = new Logger('TourController', true);

    constructor(private readonly tourService: TourService) {
    }

    @Get()
    async findAll(): Promise<Tour> {
        return this.tourService.findAll();
    }

    @Get(':id')
    async findTour(@Param('id') id): Promise<Tour> {
        return this.tourService.findTour(id);
    }


    // @Post()
    // async create(@Req() req, @Body() createTourDto: CreateTourDto) {
    //     this.logger.log('post tour');
    //     const newTour = Object.assign({}, createTourDto);
    //     return await this.tourService.create(newTour);
    // }
}