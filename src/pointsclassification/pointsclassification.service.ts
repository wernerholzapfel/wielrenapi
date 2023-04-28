import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pointsclassification } from './pointsclassification.entity';
import { Connection, getConnection, Repository } from 'typeorm';
import { Etappe } from '../etappe/etappe.entity';

@Injectable()
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
            .where('tour.id = :tourId', { tourId })
            .orderBy("pointsclassification.position", "ASC")
            .getMany();
    }

    async create(pointsclassifications: Pointsclassification[]): Promise<Pointsclassification[]> {

        const oldSC = await this.connection
            .getRepository(Pointsclassification)
            .createQueryBuilder('tourcf')
            .leftJoin('tourcf.tour', 'tour')
            .where('tour.id = :tourId', { tourId: pointsclassifications[0].tour.id })
            .getMany();

        await this.pointsclassificationRepository
            .createQueryBuilder()
            .delete()
            .from(Pointsclassification, 'scf')
            .where('id IN (:...id)', { id: oldSC.map(sc => sc.id) })
            .execute();

        await this.pointsclassificationRepository
            .createQueryBuilder()
            .insert()
            .into(Pointsclassification)
            .values(pointsclassifications)
            .execute()

        return await this.connection
            .getRepository(Pointsclassification)
            .createQueryBuilder('pointsclassification')
            .leftJoinAndSelect('pointsclassification.tourrider', 'rider')
            .leftJoinAndSelect('pointsclassification.tour', 'tour')
            .where('tour.id = :tourId', { tourId: pointsclassifications[0].tour.id })
            .getMany();
    }
}