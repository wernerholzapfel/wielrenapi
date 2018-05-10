import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {Stageclassification} from './stageclassification.entity';
import {StageclassificationService} from './stageclassification.service';
import {StageclassificationController} from './stageclassification.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Stageclassification])],
    components: [StageclassificationService],
    controllers: [StageclassificationController],
})
export class StageclassificationModule {}