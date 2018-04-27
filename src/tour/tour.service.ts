import {Component, HttpStatus} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Tour} from './tour.entity';
import {Connection, Repository} from 'typeorm';
import {HttpException} from '@nestjs/core';

@Component()
export class TourService {
    constructor(private readonly connection: Connection,
        @InjectRepository(Tour)
        private readonly tourRepository: Repository<Tour>,
    ) {}

    async findAll(): Promise<Tour[]> {
        return await this.connection
            .getRepository(Tour)
            .createQueryBuilder("tour")
            .leftJoinAndSelect("tour.teams", "team")
            .leftJoinAndSelect("team.tourRiders", "teamriders")
            .leftJoinAndSelect("teamriders.tour", "teamriderstour")
            .leftJoinAndSelect("teamriders.rider", "rider")
            .where("tour.isActive")
            .andWhere("teamriderstour.isActive")
            .getMany();
    }

    async findTour(id: string): Promise<Tour> {
        return await this.connection
            .getRepository(Tour)
            .createQueryBuilder("tour")
            .leftJoinAndSelect("tour.teams", "team")
            .leftJoinAndSelect("team.tourRiders", "teamriders")
            .leftJoinAndSelect("teamriders.tour", "teamriderstour")
            .leftJoinAndSelect("teamriders.rider", "rider")
            .where('tour.id = :id', {id})
            .andWhere('teamriderstour.id = :id', {id})
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
}