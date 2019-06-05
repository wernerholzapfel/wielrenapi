
import {Body, Controller, Get, Logger, Param, Post, Req} from '@nestjs/common';
import {TourclassificationService} from './tourclassification.service';
import {Tourclassification} from './tourclassification.entity';
import {CreateTourclassificationDto} from './create-tourclassification.dto';

@Controller('tourclassifications')
export class TourclassificationController {
    private readonly logger = new Logger('TourclassificationController', true);

    constructor(private readonly tourclassificationService: TourclassificationService) {
    }

    @Get(':tourId')
    async findByTourId(@Param('tourId') tourId): Promise<Tourclassification[]> {
        return this.tourclassificationService.findByTourId(tourId);
    }

    @Post()
    async create(@Req() req, @Body() body: Tourclassification[]) {
        this.logger.log('post tourclassification');
        // const newTourclassification = Object.assign({}, createTourclassificationDto);
        return await this.tourclassificationService.create(body);
    }
}
