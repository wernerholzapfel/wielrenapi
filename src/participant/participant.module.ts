import {CacheModule, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Participant} from './participant.entity';
import {ParticipantService} from './participant.service';
import {ParticipantController} from './participant.controller';
import { Pushtoken } from 'pushtoken/pushtoken.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Participant, Pushtoken]),
        CacheModule.register({ttl: 0})],
    providers: [ParticipantService],
    controllers: [ParticipantController],
})
export class ParticipantModule {}
