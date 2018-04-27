import {Component, HttpStatus} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Rider} from './rider.entity';
import {Repository} from 'typeorm';
import {HttpException} from '@nestjs/core';

@Component()
export class RiderService {
    constructor(
        @InjectRepository(Rider)
        private readonly riderRepository: Repository<Rider>,
    ) {}

    async findAll(): Promise<Rider[]> {
        return await this.riderRepository.find();
    }

    async create(rider: Rider): Promise<Rider> {
        return await this.riderRepository.save(rider)
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }
}