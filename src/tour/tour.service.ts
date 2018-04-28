import {Component, HttpStatus, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Tour} from './tour.entity';
import {Connection, getConnection, getRepository, Repository} from 'typeorm';
import {HttpException} from '@nestjs/core';
import {Team} from '../teams/team.entity';

export interface AddTeamsRequest {
    tour: Tour;
    teams: Team[];
}

@Component()
export class TourService {
    private readonly logger = new Logger('TourService', true);

    constructor(private readonly connection: Connection,
                @InjectRepository(Tour)
                private readonly tourRepository: Repository<Tour>,) {
    }

    async findAll(): Promise<Tour[]> {
        return await this.connection
            .getRepository(Tour)
            .createQueryBuilder('tour')
            .getMany();
    }

    async findTour(id: string): Promise<Tour> {
        return await this.connection
            .getRepository(Tour)
            .createQueryBuilder('tour')
            .leftJoinAndSelect('tour.teams', 'team')
            .leftJoinAndSelect('team.tourRiders', 'teamriders')
            .leftJoinAndSelect('teamriders.rider', 'rider')
            // .leftJoinAndSelect('teamriders.tour', 'tourteamriders')
            .where('tour.id = :id', {id})
            .andWhere('(teamriders.tour.id = :id OR teamriders.tour.id IS NULL)', {id})
            .getOne();
    }

    async create(tour: Tour): Promise<Tour> {
        return await this.tourRepository.save(tour)
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }

    async addTeamsToTour(bodyTour: AddTeamsRequest): Promise<any> {
        const storedTour = await getRepository(Tour).createQueryBuilder('tour')
            .leftJoinAndSelect('tour.teams', 'teams')
            .where('tour.id = :tourId', {tourId: bodyTour.tour.id})
            .getOne();

        await storedTour.teams.forEach(async team => {
            this.logger.log('delete: ' + team.teamName);
            await
                getConnection()
                    .createQueryBuilder()
                    .relation(Tour, 'teams')
                    .of(bodyTour.tour)
                    .remove(team);
        });

        return await getConnection()
            .createQueryBuilder()
            .relation(Tour, 'teams')
            .of(bodyTour.tour)
            .add(bodyTour.teams);
    }
}
