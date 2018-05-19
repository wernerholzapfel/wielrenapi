import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {Tourclassification} from './tourclassification.entity';
import {TourclassificationService} from './tourclassification.service';
import {TourclassificationController} from './tourclassification.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Tourclassification])],
    components: [TourclassificationService],
    controllers: [TourclassificationController],
})
export class TourclassificationModule {}