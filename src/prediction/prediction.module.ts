import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {Prediction} from './prediction.entity';
import {PredictionService} from './prediction.service';
import {PredictionController} from './prediction.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Prediction])],
    components: [PredictionService],
    controllers: [PredictionController],
})
export class PredictionModule {}