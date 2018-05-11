import {Controller} from '@nestjs/common/utils/decorators/controller.decorator';
import {Body, Get, Logger, Post, Req} from '@nestjs/common';
import {ParticipantService} from './participant.service';
import {Participant} from './participant.entity';
import {CreateParticipantDto} from './create-participant.dto';

@Controller('participants')
export class ParticipantController {
    private readonly logger = new Logger('ParticipantController', true);

    constructor(private readonly participantService: ParticipantService) {
    }

    @Get()
    async findAll(): Promise<Participant[]> {
        return this.participantService.findAll();
    }
    @Get('/stand')
    async stand(): Promise<Participant[]> {
        return this.participantService.getStand();
    }



    @Post()
    async create(@Req() req, @Body() createParticipantDto: CreateParticipantDto) {
        this.logger.log('post participant');
        const newParticipant = Object.assign({}, createParticipantDto);
        return await this.participantService.create(newParticipant);
    }
}