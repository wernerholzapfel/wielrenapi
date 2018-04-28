import {Component, HttpStatus} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Team} from './team.entity';
import {Connection, Repository} from 'typeorm';
import {HttpException} from '@nestjs/core';

@Component()
export class TeamService {
    constructor(
        @InjectRepository(Team)
        private readonly teamRepository: Repository<Team>,
        private readonly connection: Connection,
    ) {}

    async findAll(): Promise<Team[]> {
        return await this.connection
            .getRepository(Team)
            .createQueryBuilder('team')
            .getMany();
    }

    async create(team: Team): Promise<Team> {
        return await this.teamRepository.save(team)
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }
}