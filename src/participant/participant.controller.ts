import {Controller} from '@nestjs/common/utils/decorators/controller.decorator';
import {Body, Get, Logger, Param, Post, Req} from '@nestjs/common';
import {ParticipantService} from './participant.service';
import {Participant} from './participant.entity';
import {CreateParticipantDto} from './create-participant.dto';
import {Tour} from '../tour/tour.entity';

@Controller('participants')
export class ParticipantController {
    private readonly logger = new Logger('ParticipantController', true);

    constructor(private readonly participantService: ParticipantService) {
    }

    @Get('/:tourId')
    async findAll(@Param('tourId') tourId): Promise<Participant[]> {
        return this.participantService.findAll(tourId);
    }

    @Get('/table/:id')
    async updateTable(@Param('id') id): Promise<Participant[]> {
        return this.participantService.updateTable(id);
    }

    @Post()
    async create(@Req() req, @Body() createParticipantDto: CreateParticipantDto) {
        this.logger.log('post participant');
        const newParticipant = Object.assign({}, createParticipantDto);
        return await this.participantService.create(newParticipant);
    }
}