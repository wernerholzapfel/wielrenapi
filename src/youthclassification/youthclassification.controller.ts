import {Controller} from '@nestjs/common/utils/decorators/controller.decorator';
import {Body, Get, Logger, Param, Post, Req} from '@nestjs/common';
import {YouthclassificationService} from './youthclassification.service';
import {Youthclassification} from './youthclassification.entity';
import {CreateYouthclassificationDto} from './create-youthclassification.dto';

@Controller('youthclassifications')
export class YouthclassificationController {
    private readonly logger = new Logger('YouthclassificationController', true);

    constructor(private readonly youthclassificationService: YouthclassificationService) {
    }

    @Get(':tourId')
    async findByTourId(@Param('tourId') tourId): Promise<Youthclassification[]> {
        return this.youthclassificationService.findByTourId(tourId);
    }

    @Post()
    async create(@Req() req, @Body() body: Youthclassification[]) {
        this.logger.log('post youthclassification');
        // const newYouthclassification = Object.assign({}, createYouthclassificationDto);
        return await this.youthclassificationService.create(body);
    }
}
