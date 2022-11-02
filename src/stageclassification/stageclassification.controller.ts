
import {Body, Controller, Get, Logger, Param, Post, Req} from '@nestjs/common';
import {StageclassificationService} from './stageclassification.service';
import {Stageclassification} from './stageclassification.entity';
import {CreateStageclassificationDto} from './create-stageclassification.dto';

@Controller('stageclassifications')
export class StageclassificationController {
    private readonly logger = new Logger('StageclassificationController', true);

    constructor(private readonly stageclassificationService: StageclassificationService) {
    }

    @Get(':etappeId')
    async findByEtappeId(@Param('etappeId') etappeId): Promise<Stageclassification[]> {
        return this.stageclassificationService.findByEtappeId(etappeId);
    }

    @Post()
    async create(@Req() req, @Body() body: Stageclassification[]) {
        this.logger.log('post stageclassification');
        return await this.stageclassificationService.create(body);
    }
}
