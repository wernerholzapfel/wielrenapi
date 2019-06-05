import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {Mountainclassification} from './mountainclassification.entity';
import {MountainclassificationService} from './mountainclassification.service';
import {MountainclassificationController} from './mountainclassification.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Mountainclassification])],
    providers: [MountainclassificationService],
    controllers: [MountainclassificationController],
})
export class MountainclassificationModule {}