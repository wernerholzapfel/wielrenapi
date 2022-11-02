
import {Body, CacheInterceptor, Controller, Delete, Get, Logger, Param, Post, Put, Req, UseInterceptors} from '@nestjs/common';
import {TourridersService} from './tourriders.service';
import {CreateTourridersDto} from './create-tourriders.dto';
import {Tour} from '../tour/tour.entity';

@Controller('tourriders')
export class TourridersController {
    private readonly logger = new Logger('TourridersController', true);

    constructor(private readonly tourridersService: TourridersService) {
    }

    @Get()
    async findActive(): Promise<Tour> {
        return this.tourridersService.findActive();
    }

    @UseInterceptors(CacheInterceptor)
    @Get('/details/:tourId')
    async getDetails(@Param('tourId') tourId): Promise<any[]> {
        return this.tourridersService.getDetails(tourId);
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

    @Delete(':tourridersId')
    async delete(@Param('tourridersId') tourridersId) {
        return await this.tourridersService.delete(tourridersId);
    }
}
