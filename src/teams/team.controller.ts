import { Body, Controller, Get, Logger, Param, Post, Req } from '@nestjs/common';
import { TeamService } from './team.service';
import { Team } from './team.entity';
import { CreateTeamDto } from './create-team.dto';

@Controller('teams')
export class TeamController {
    private readonly logger = new Logger('TeamController', true);

    constructor(private readonly teamService: TeamService) {
    }

    @Get()
    async findAll(): Promise<Team[]> {
        return this.teamService.findAll();
    }
    @Get('tour/:id')
    async getTeamsForTour(@Param('id') tourId): Promise<Team[]> {
        return this.teamService.getTeamsForTour(tourId);
    }
    @Get('admin/tour/:id')
    async getAllTeamsWithTourIndicator(@Param('id') tourId): Promise<Team[]> {
        return this.teamService.getAllTeamsWithTourIndicator(tourId);
    }

    @Post()
    async create(@Req() req, @Body() createTeamDto: CreateTeamDto) {
        this.logger.log('post team');
        const newTeam = Object.assign({}, createTeamDto);
        return await this.teamService.create(newTeam);
    }
}