import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {Youthclassification} from './youthclassification.entity';
import {YouthclassificationService} from './youthclassification.service';
import {YouthclassificationController} from './youthclassification.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Youthclassification])],
    providers: [YouthclassificationService],
    controllers: [YouthclassificationController],
})
export class YouthclassificationModule {}