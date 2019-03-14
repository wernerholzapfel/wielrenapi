import {Body, Controller, Get, Logger, Param, Post, Req} from '@nestjs/common';
import {PredictionService} from './prediction.service';
import {Prediction} from './prediction.entity';
import {CreatePredictionDto} from './create-prediction.dto';

@Controller('predictions')
export class PredictionController {
    private readonly logger = new Logger('PredictionController', true);

    constructor(private readonly predictionService: PredictionService) {
    }

    @Get()
    async findAll(): Promise<Prediction[]> {
        return this.predictionService.findAll();
    }

    @Get('user/:id')
    async findByParticipant(@Param('id') id, @Req() req): Promise<Prediction[]> {
        return this.predictionService.findByParticipant(req.user.email, id);
    }

    @Post()
    async create(@Req() req, @Body() body,  createPredictionDto: CreatePredictionDto) {
        this.logger.log(body.riders.length);
        return await this.predictionService.create(body, req.user.email, req.user.displayName);
    }
}