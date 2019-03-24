
import {Body, Controller, Get, Logger, Param, Post, Req} from '@nestjs/common';
import {ParticipantService} from './participant.service';
import {Participant} from './participant.entity';
import {CreateParticipantDto} from './create-participant.dto';
import {Tour} from '../tour/tour.entity';
import {Prediction} from '../prediction/prediction.entity';

@Controller('participants')
export class ParticipantController {
    private readonly logger = new Logger('ParticipantController', true);

    constructor(private readonly participantService: ParticipantService) {
    }

    @Get('loggedIn')
    async findByParticipant(@Req() req): Promise<Participant> {
        return this.participantService.loggedIn(req.user.email);
    }
    @Get('/:tourId')
    async findAll(@Param('tourId') tourId): Promise<Participant[]> {
        return this.participantService.findAll(tourId);
    }

    @Get('/table/:id')
    async updateTable(@Param('id') id): Promise<Participant[]> {
        return this.participantService.updateTable(id);
    }

    @Get('/table/:tourId/etappe/:etappeId')
    async getEtappe(@Param('tourId') tourId, @Param('etappeId') etappeId): Promise<Participant[]> {
        return this.participantService.getEtappe(tourId, etappeId);
    }

    @Get('/table/:tourId/latestetappe')
    async getLastEtappe(@Param('tourId') tourId): Promise<Participant[]> {
        return this.participantService.getLatestEtappe(tourId);
    }

    @Get('/rider/:tourriderId')
    async getTourRider(@Param('tourriderId') tourriderId): Promise<any> {
        return this.participantService.getTourRider(tourriderId);
    }

    @Post()
    async create(@Req() req, @Body() createParticipantDto: CreateParticipantDto) {
        this.logger.log('post participant');
        const newParticipant = Object.assign({}, createParticipantDto);
        return await this.participantService.create(newParticipant, req.user.email);
    }
}