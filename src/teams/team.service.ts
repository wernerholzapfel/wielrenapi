import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Team} from './team.entity';
import {Connection, Repository} from 'typeorm';
import {CreateTeamDto} from './create-team.dto';

@Injectable()
export class TeamService {
    constructor(
        @InjectRepository(Team)
        private readonly teamRepository: Repository<Team>,
        private readonly connection: Connection,
    ) {
    }

    async findAll(): Promise<Team[]> {
        return await this.connection
            .getRepository(Team)
            .createQueryBuilder('team')
            .getMany();
    }
        async getTeamsForTour(tourId: string): Promise<Team[]> {
        return await this.connection
            .getRepository(Team)
            .createQueryBuilder('team')
            .leftJoin('team.tour', 'tour','tour.id = :tourId', {tourId})
            .leftJoinAndSelect('team.tourRiders', 'tourRiders', '"tourRiders"."tourId" = :tourId', {tourId})
            .leftJoinAndSelect('tourRiders.rider', 'riders')
            .where('tour.id = :tourId', {tourId})
            .orderBy('team.teamName')
            .addOrderBy('tourRiders.waarde')
            .getMany();
    }
    
    async getAllTeamsWithTourIndicator(tourId): Promise<Team[]> {
        const teams = await this.connection
            .getRepository(Team)
            .createQueryBuilder('team')
            .leftJoinAndSelect('team.tour', 'tour','tour.id = :tourId', {tourId})
            .getMany();

            return teams.map(team => {
                return {
                    ...team,
                    selected: team.tour.length > 0
                }
            })
    }

    async create(team: CreateTeamDto): Promise<Team> {
        return await this.teamRepository.save(team)
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }
}