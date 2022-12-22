
import {Body, Controller, Get, Logger, Param, Post, Req} from '@nestjs/common';
import {TourService} from './tour.service';
import {Tour} from './tour.entity';
import {AddTeamsRequestDto, CreateTourDto} from './create-tour.dto';

@Controller()
export class TourController {
    private readonly logger = new Logger('TourController', true);

    constructor(private readonly tourService: TourService) {
    }

    @Get('tours')
    async findAll(): Promise<Tour[]> {
        return this.tourService.findAll();

    }  
    
    @Get('tour/active')
    async getActiveTour(): Promise<Tour> {
        return this.tourService.getActiveTour();
    }

    @Get('tours/:id')
    async findTour(@Param('id') id): Promise<Tour> {
        return this.tourService.findTour(id);
    }

    @Post('tours/setteams')
    async addTeams(@Req() req, @Body() addTeamsRequestDto: AddTeamsRequestDto) {
        this.logger.log('AddTeamsRequest');
        this.logger.log(addTeamsRequestDto);
        await this.tourService.deleteTeamsFromTour(addTeamsRequestDto.tour);
        await this.tourService.addTeamsToTour(addTeamsRequestDto);
        return await this.tourService.findTour(addTeamsRequestDto.tour.id);
    }

    @Post('tours')
    async create(@Req() req, @Body() createTourDto: CreateTourDto) {
        this.logger.log('post tour');
        const newTour = Object.assign({}, createTourDto);
        return await this.tourService.create(newTour);
    }
}