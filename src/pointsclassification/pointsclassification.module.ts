import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {Pointsclassification} from './pointsclassification.entity';
import {PointsclassificationService} from './pointsclassification.service';
import {PointsclassificationController} from './pointsclassification.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Pointsclassification])],
    components: [PointsclassificationService],
    controllers: [PointsclassificationController],
})
export class PointsclassificationModule {}