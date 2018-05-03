import {Component, HttpStatus} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Participant} from './participant.entity';
import {Connection, Repository} from 'typeorm';
import {HttpException} from '@nestjs/core';

@Component()
export class ParticipantService {
    constructor(
        @InjectRepository(Participant)
        private readonly participantRepository: Repository<Participant>,
        private readonly connection: Connection,
    ) {}

    async findAll(): Promise<Participant[]> {
        return await this.connection
            .getRepository(Participant)
            .createQueryBuilder('participant')
            .getMany();
    }

    async create(participant: Participant): Promise<Participant> {
        return await this.participantRepository.save(participant)
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }
}