import {Controller} from '@nestjs/common/utils/decorators/controller.decorator';
import {Body, Get, Logger, Param, Post, Req} from '@nestjs/common';
import {MountainclassificationService} from './mountainclassification.service';
import {Mountainclassification} from './mountainclassification.entity';
import {CreateMountainclassificationDto} from './create-mountainclassification.dto';

@Controller('mountainclassifications')
export class MountainclassificationController {
    private readonly logger = new Logger('MountainclassificationController', true);

    constructor(private readonly mountainclassificationService: MountainclassificationService) {
    }

    @Get(':tourId')
    async findByTourId(@Param('tourId') tourId): Promise<Mountainclassification[]> {
        return this.mountainclassificationService.findByTourId(tourId);
    }

    @Post()
    async create(@Req() req, @Body() body: Mountainclassification[]) {
        this.logger.log('post mountainclassification');
        // const newMountainclassification = Object.assign({}, createMountainclassificationDto);
        return await this.mountainclassificationService.create(body);
    }
}
