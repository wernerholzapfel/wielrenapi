import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Halloffame } from './halloffame.entity';
import { HalloffameController } from './halloffame.controller';
import { HalloffameService } from './halloffame.service';

@Module({
    imports: [TypeOrmModule.forFeature([Halloffame])],
    providers: [HalloffameService],
    controllers: [HalloffameController],
})
export class HalloffameModule {}