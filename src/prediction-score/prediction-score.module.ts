import { Module } from '@nestjs/common';
import { PredictionScoreController } from './prediction-score.controller';
import { PredictionScoreService } from './prediction-score.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {PredictionScore} from './prediction-score.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PredictionScore])],
  controllers: [PredictionScoreController],
  providers: [PredictionScoreService]
})
export class PredictionScoreModule {}
