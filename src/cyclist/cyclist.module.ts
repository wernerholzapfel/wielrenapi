import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {Cyclist} from './cyclist.entity';
import {CyclistService} from './cyclist.service';
import {CyclistController} from './cyclists.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Cyclist])],
    components: [CyclistService],
    controllers: [CyclistController],
})
export class CyclistModule {}