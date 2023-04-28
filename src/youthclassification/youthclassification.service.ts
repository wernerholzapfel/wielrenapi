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

        await this.youthclassificationRepository
            .createQueryBuilder()
            .delete()
            .from(Youthclassification)
            .where('id IN (:...id)', { id: oldSC.map(sc => sc.id) })
            .execute();

        await this.youthclassificationRepository
            .createQueryBuilder()
            .insert()
            .into(Youthclassification)
            .values(youthclassifications)
            .execute()

        return await this.connection
            .getRepository(Youthclassification)
            .createQueryBuilder('youthclassification')
            .leftJoinAndSelect('youthclassification.tourrider', 'rider')
            .leftJoinAndSelect('youthclassification.tour', 'tour')
            .where('tour.id = :tourId', {tourId: youthclassifications[0].tour.id})
            .getMany();
    }
}
