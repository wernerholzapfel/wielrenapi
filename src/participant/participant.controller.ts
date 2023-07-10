
import {Body, CacheInterceptor, Controller, Get, Logger, Param, Post, Put, Req, UseInterceptors} from '@nestjs/common';
import {ParticipantService} from './participant.service';
import {Participant} from './participant.entity';
import {AddPushTokenDto, CreateParticipantDto, UpdateParticipantDto} from './create-participant.dto';

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

    // @UseInterceptors(CacheInterceptor)
    // @Get('/table/:id')
    // async getTable(@Param('id') id): Promise<any[]> {
    //         return this.participantService.getTable(id);
    // }

    @Get('/updateTable/:id')
    async setLastUpdateDate(@Param('id') id): Promise<void> {
        return this.participantService.invalidateCacheAndSetLastUpdated(id);
    }
    
    @Put('/cache')
    async invalidateCache(): Promise<void> {
        return this.participantService.invalidateCache();
    }

    @UseInterceptors(CacheInterceptor)
    @Get('/table/:tourId/etappe/:etappeId')
    async getEtappe(@Param('tourId') tourId, @Param('etappeId') etappeId): Promise<Participant[]> {
        return this.participantService.getEtappe(tourId, etappeId);
    }

    @UseInterceptors(CacheInterceptor)
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
        return await this.participantService.create(newParticipant, req.user.email, req.user.uid);
    }
    
    @Put()
    async update(@Req() req, @Body() updateParticipantDto: UpdateParticipantDto) {
        const updatedParticipant = Object.assign({}, updateParticipantDto);
        return await this.participantService.update(updatedParticipant, req.user.email.toLowerCase());
    }

    @Put('pushtoken')
    async addPushtoken(@Req() req, @Body() addPushTokenDto: AddPushTokenDto) {
        return await this.participantService.addPushToken(addPushTokenDto, req.user.uid);
    }
}
