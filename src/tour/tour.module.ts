import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {Tour} from './tour.entity';
import {TourService} from './tour.service';
import {TourController} from './tours.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Tour])],
    providers: [TourService],
    controllers: [TourController],
})
export class TourModule {}