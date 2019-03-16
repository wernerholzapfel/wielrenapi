import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {Tourriders} from './tourriders.entity';
import {TourridersService} from './tourriders.service';
import {TourridersController} from './tourriders.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Tourriders])],
    providers: [TourridersService],
    controllers: [TourridersController],
})
export class TourridersModule {}