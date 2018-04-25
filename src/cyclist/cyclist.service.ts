import {Component, HttpStatus} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Cyclist} from './cyclist.entity';
import {Repository} from 'typeorm';
import {HttpException} from '@nestjs/core';

@Component()
export class CyclistService {
    constructor(
        @InjectRepository(Cyclist)
        private readonly cyclistRepository: Repository<Cyclist>,
    ) {}

    async findAll(): Promise<Cyclist[]> {
        return await this.cyclistRepository.find();
    }

    async create(cyclist: Cyclist): Promise<Cyclist> {
        return await this.cyclistRepository.save(cyclist)
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }
}