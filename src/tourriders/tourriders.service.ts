import {Component, HttpStatus} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Tourriders} from './tourriders.entity';
import {Connection, Repository} from 'typeorm';
import {HttpException} from '@nestjs/core';

@Component()
export class TourridersService {
    constructor(private readonly connection: Connection,
        @InjectRepository(Tourriders)
        private readonly tourridersRepository: Repository<Tourriders>,
    ) {}

    async findAll(): Promise<Tourriders[]> {
        return await this.connection
            .getRepository(Tourriders)
            .createQueryBuilder("tourriders")
            .leftJoinAndSelect("tourriders.tour", "tour")
            .leftJoinAndSelect("tourriders.team", "team")
            .leftJoinAndSelect("team.riders", "rider")
            .leftJoinAndSelect("rider", "rider")
            .where("tour.isActive")
            .getOne();
    }

    async create(tourriders: Tourriders): Promise<Tourriders> {
        return await this.tourridersRepository.save(tourriders)
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }
}