import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {Team} from './team.entity';
import {TeamService} from './team.service';
import {TeamController} from './team.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Team])],
    components: [TeamService],
    controllers: [TeamController],
})
export class TeamModule {}