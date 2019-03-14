
import {Body, Controller, Get, Logger, Param, Post, Req} from '@nestjs/common';
import {AddTeamsRequest, TourService} from './tour.service';
import {Tour} from './tour.entity';
import {CreateTourDto} from './create-tour.dto';

@Controller()
export class TourController {
    private readonly logger = new Logger('TourController', true);

    constructor(private readonly tourService: TourService) {
    }

    @Get('tours')
    async findAll(): Promise<Tour[]> {
        return this.tourService.findAll();
    }

    @Get('tours/:id')
    async findTour(@Param('id') id): Promise<Tour> {
        return this.tourService.findTour(id);
    }

    @Post('tours/setteams')
    async addTeams(@Req() req, @Body() body: AddTeamsRequest) {
        await this.tourService.deleteTeamsFromTour(body.tour);
        await this.tourService.addTeamsToTour(body);
        return await this.tourService.findTour(body.tour.id);
    }

    @Post('tours')
    async create(@Req() req, @Body() createTourDto: CreateTourDto) {
        this.logger.log('post tour');
        const newTour = Object.assign({}, createTourDto);
        return await this.tourService.create(newTour);
    }
}