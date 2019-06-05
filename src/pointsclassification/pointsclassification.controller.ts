
import {Body, Controller, Get, Logger, Param, Post, Req} from '@nestjs/common';
import {PointsclassificationService} from './pointsclassification.service';
import {Pointsclassification} from './pointsclassification.entity';
import {CreatePointsclassificationDto} from './create-pointsclassification.dto';

@Controller('pointsclassifications')
export class PointsclassificationController {
    private readonly logger = new Logger('PointsclassificationController', true);

    constructor(private readonly pointsclassificationService: PointsclassificationService) {
    }

    @Get(':tourId')
    async findByTourId(@Param('tourId') tourId): Promise<Pointsclassification[]> {
        return this.pointsclassificationService.findByTourId(tourId);
    }

    @Post()
    async create(@Req() req, @Body() body: Pointsclassification[]) {
        this.logger.log('post pointsclassification');
        // const newPointsclassification = Object.assign({}, createPointsclassificationDto);
        return await this.pointsclassificationService.create(body);
    }
}
