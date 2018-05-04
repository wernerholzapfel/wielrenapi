import {Controller} from '@nestjs/common/utils/decorators/controller.decorator';
import {Body, Get, Logger, Post, Req} from '@nestjs/common';
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

    @Post()
    async create(@Req() req, @Body() body,  createPredictionDto: CreatePredictionDto) {
        this.logger.log(body.riders.length);
        return await this.predictionService.create(body, req.user.email, req.user.displayName);
    }
}