import {Component, HttpStatus} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Pointsclassification} from './pointsclassification.entity';
import {Connection, getConnection, Repository} from 'typeorm';
import {HttpException} from '@nestjs/common';
import {Etappe} from '../etappe/etappe.entity';

@Component()
export class PointsclassificationService {
    constructor(@InjectRepository(Pointsclassification)
                private readonly pointsclassificationRepository: Repository<Pointsclassification>,
                private readonly connection: Connection,) {
    }

    async findByTourId(tourId): Promise<Pointsclassification[]> {
        return await this.connection
            .getRepository(Pointsclassification)
            .createQueryBuilder('pointsclassification')
            .leftJoinAndSelect('pointsclassification.tourrider', 'tourrider')
            .leftJoinAndSelect('tourrider.rider', 'rider')
            .leftJoinAndSelect('pointsclassification.tour', 'tour')
            .where('tour.id = :tourId', {tourId})
            .orderBy("pointsclassification.position", "ASC")
            .getMany();
    }

    async create(pointsclassifications: Pointsclassification[]): Promise<Pointsclassification[]> {

        const oldSC = await this.connection
            .getRepository(Pointsclassification)
            .createQueryBuilder('tourcf')
            .leftJoin('tourcf.tour', 'tour')
            .where('tour.id = :tourId', {tourId: pointsclassifications[0].tour.id})
            .getMany();

        await oldSC.forEach(async scf => {
            await this.connection
                .getRepository(Pointsclassification)
                .createQueryBuilder()
                .delete()
                .from(Pointsclassification, 'scf')
                .where('id = :id', {id: scf.id})
                .execute();
        });

        await pointsclassifications.forEach(async tourClassificiation => {
            await this.pointsclassificationRepository.save(tourClassificiation)
                .catch((err) => {
                    throw new HttpException({
                        message: err.message,
                        statusCode: HttpStatus.BAD_REQUEST,
                    }, HttpStatus.BAD_REQUEST);
                });
        });

        return await this.connection
            .getRepository(Pointsclassification)
            .createQueryBuilder('pointsclassification')
            .leftJoinAndSelect('pointsclassification.tourrider', 'rider')
            .leftJoinAndSelect('pointsclassification.tour', 'tour')
            .where('tour.id = :tourId', {tourId: pointsclassifications[0].tour.id})
            .getMany();
    }
}