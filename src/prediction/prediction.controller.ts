import {Body, Controller, Delete, Get, Logger, Param, Post, Req} from '@nestjs/common';
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

    @Get('user/:tourid')
    async findByParticipant(@Param('tourid') tourid, @Req() req): Promise<Prediction[]> {
        return this.predictionService.findByParticipant(req.user.email, tourid);
    }
    
    @Get('state/:tourid')
    async getPredictionsstate(@Param('tourid') tourid): Promise<Prediction[]> {
        return this.predictionService.getPredictionsstate(tourid);
    }

    @Post()
    async createPrediction(@Req() req, @Body() body,  createPredictionDto: CreatePredictionDto) {
        return await this.predictionService.createPrediction(body, req.user.email, req.user.displayName);
    }

    @Delete(':predictionId')
    async delete(@Param('predictionId') predictionId, @Req() req) {
        return await this.predictionService.delete(predictionId, req.user.email);
    }
}
