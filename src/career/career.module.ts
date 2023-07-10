import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareerService } from './career.service';
import { CareerController } from './career.controller';
import { Career } from './career.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Career])],
    providers: [CareerService],
    controllers: [CareerController],
})
export class CareerModule {}