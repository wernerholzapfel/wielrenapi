import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {Rider} from './rider.entity';
import {RiderService} from './rider.service';
import {RiderController} from './riders.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Rider])],
    providers: [RiderService],
    controllers: [RiderController],
})
export class RiderModule {}