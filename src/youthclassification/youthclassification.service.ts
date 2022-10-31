import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Youthclassification} from './youthclassification.entity';
import {Connection, getConnection, Repository} from 'typeorm';
import {Etappe} from '../etappe/etappe.entity';

@Injectable()
export class YouthclassificationService {
    constructor(@InjectRepository(Youthclassification)
                private readonly youthclassificationRepository: Repository<Youthclassification>,
                private readonly connection: Connection) {
    }

    async findByTourId(tourId): Promise<Youthclassification[]> {
        return await this.connection
            .getRepository(Youthclassification)
            .createQueryBuilder('youthclassification')
            .leftJoinAndSelect('youthclassification.tourrider', 'tourrider')
            .leftJoinAndSelect('tourrider.rider', 'rider')
            .leftJoinAndSelect('youthclassification.tour', 'tour')
            .where('tour.id = :tourId', {tourId})
            .orderBy('youthclassification.position', 'ASC')
            .getMany();
    }

    async create(youthclassifications: Youthclassification[]): Promise<Youthclassification[]> {

        const oldSC = await this.connection
            .getRepository(Youthclassification)
            .createQueryBuilder('tourcf')
            .leftJoin('tourcf.tour', 'tour')
            .where('tour.id = :tourId', {tourId: youthclassifications[0].tour.id})
            .getMany();

        await oldSC.forEach(async scf => {
            await this.connection
                .getRepository(Youthclassification)
                .createQueryBuilder()
                .delete()
                .from(Youthclassification, 'scf')
                .where('id = :id', {id: scf.id})
                .execute();
        });

        await youthclassifications.forEach(async tourClassificiation => {
            await this.youthclassificationRepository.save(tourClassificiation)
                .catch((err) => {
                    throw new HttpException({
                        message: err.message,
                        statusCode: HttpStatus.BAD_REQUEST,
                    }, HttpStatus.BAD_REQUEST);
                });
        });

        return await this.connection
            .getRepository(Youthclassification)
            .createQueryBuilder('youthclassification')
            .leftJoinAndSelect('youthclassification.tourrider', 'rider')
            .leftJoinAndSelect('youthclassification.tour', 'tour')
            .where('tour.id = :tourId', {tourId: youthclassifications[0].tour.id})
            .getMany();
    }
}
