
import {Body, CacheInterceptor, Controller, Delete, Get, Logger, Param, Post, Put, Req, UseInterceptors} from '@nestjs/common';
import {TourridersService} from './tourriders.service';
import {CreateTourridersDto} from './create-tourriders.dto';
import {Tour} from '../tour/tour.entity';
import { Tourriders } from './tourriders.entity';

@Controller('tourriders')
export class TourridersController {
    private readonly logger = new Logger('TourridersController', true);

    constructor(private readonly tourridersService: TourridersService) {
    }

    @Get()
    async findActive(): Promise<Tour> {
        return this.tourridersService.findActive();
    }
     @Get('tour/:id')
    async tourridersForTour(@Param('id') tourId): Promise<Tourriders[]> {
        return this.tourridersService.tourridersForTour(tourId);
    }
    
    @Get('tour/:tourid/team/:teamid')
    async tourridersForTeam(@Param('tourid') tourId, @Param('teamid') teamId): Promise<Tourriders[]> {
        return this.tourridersService.tourridersForTeam(tourId, teamId);
    }

    @UseInterceptors(CacheInterceptor)
    @Get('/details/:tourId')
    async getDetails(@Param('tourId') tourId): Promise<any[]> {
        return this.tourridersService.getDetails(tourId);
    }

    @Get('/newdetails/:tourId')
    async getNewDetails(@Param('tourId') tourId): Promise<any[]> {
        return this.tourridersService.getNewDetails(tourId);
    }

    @Put('/details/:tourId')
    async updateTourridersFirebase(@Param('tourId') tourId): Promise<any[]> {
        return this.tourridersService.updateTourridersFirebase(tourId);
    }

    @Post()
    async create(@Req() req, @Body() createTourridersDto: CreateTourridersDto) {
        this.logger.log('post tourriders');
        const newTourriders = Object.assign({}, createTourridersDto);
        return await this.tourridersService.create(newTourriders);
    }
    @Put()
    async update(@Req() req, @Body() updateTourridersDto: any) {
        this.logger.log('update tourriders');
        return await this.tourridersService.update(updateTourridersDto);
    }

    @Delete(':tourridersId')
    async delete(@Param('tourridersId') tourridersId) {
        return await this.tourridersService.delete(tourridersId);
    }
}
