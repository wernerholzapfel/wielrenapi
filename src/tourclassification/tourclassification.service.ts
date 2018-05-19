import {Component, HttpStatus} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Tourclassification} from './tourclassification.entity';
import {Connection, getConnection, Repository} from 'typeorm';
import {HttpException} from '@nestjs/common';
import {Etappe} from '../etappe/etappe.entity';

@Component()
export class TourclassificationService {
    constructor(@InjectRepository(Tourclassification)
                private readonly tourclassificationRepository: Repository<Tourclassification>,
                private readonly connection: Connection,) {
    }

    async findByTourId(tourId): Promise<Tourclassification[]> {
        return await this.connection
            .getRepository(Tourclassification)
            .createQueryBuilder('tourclassification')
            .leftJoinAndSelect('tourclassification.tourrider', 'tourrider')
            .leftJoinAndSelect('tourrider.rider', 'rider')
            .leftJoinAndSelect('tourclassification.tour', 'tour')
            .where('tour.id = :tourId', {tourId})
            .getMany();
    }

    async create(tourclassifications: Tourclassification[]): Promise<Tourclassification[]> {

        const oldSC = await this.connection
            .getRepository(Tourclassification)
            .createQueryBuilder('tourcf')
            .leftJoin('tourcf.tour', 'tour')
            .where('tour.id = :tourId', {tourId: tourclassifications[0].tour.id})
            .getMany();

        await oldSC.forEach(async scf => {
            await this.connection
                .getRepository(Tourclassification)
                .createQueryBuilder()
                .delete()
                .from(Tourclassification, 'scf')
                .where('id = :id', {id: scf.id})
                .execute();
        });

        await tourclassifications.forEach(async tourClassificiation => {
            await this.tourclassificationRepository.save(tourClassificiation)
                .catch((err) => {
                    throw new HttpException({
                        message: err.message,
                        statusCode: HttpStatus.BAD_REQUEST,
                    }, HttpStatus.BAD_REQUEST);
                });
        });

        return await this.connection
            .getRepository(Tourclassification)
            .createQueryBuilder('tourclassification')
            .leftJoinAndSelect('tourclassification.tourrider', 'rider')
            .leftJoinAndSelect('tourclassification.tour', 'tour')
            .where('tour.id = :tourId', {tourId: tourclassifications[0].tour.id})
            .getMany();
    }
}