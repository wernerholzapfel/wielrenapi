import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tourclassification } from './tourclassification.entity';
import { Connection, getConnection, Repository } from 'typeorm';

@Injectable()
export class TourclassificationService {
    constructor(@InjectRepository(Tourclassification)
    private readonly tourclassificationRepository: Repository<Tourclassification>,
        private readonly connection: Connection,) {
    }
    private readonly logger = new Logger('TourclassificationService', true);

    async findByTourId(tourId): Promise<Tourclassification[]> {
        return await this.connection
            .getRepository(Tourclassification)
            .createQueryBuilder('tourclassification')
            .leftJoinAndSelect('tourclassification.tourrider', 'tourrider')
            .leftJoinAndSelect('tourrider.rider', 'rider')
            .leftJoinAndSelect('tourclassification.tour', 'tour')
            .where('tour.id = :tourId', { tourId })
            .orderBy("tourclassification.position", "ASC")
            .getMany();
    }

    async create(tourclassifications: Tourclassification[]): Promise<Tourclassification[]> {

        await this.tourclassificationRepository
            .createQueryBuilder()
            .delete()
            .from(Tourclassification, 'scf')
            .where('tour.id = :tourId', { tourId: tourclassifications[0].tour.id })
            .execute();

        await this.tourclassificationRepository
            .createQueryBuilder()
            .insert()
            .into(Tourclassification)
            .values(tourclassifications)
            .execute()

        return await this.connection
            .getRepository(Tourclassification)
            .createQueryBuilder('tourclassification')
            .leftJoinAndSelect('tourclassification.tourrider', 'rider')
            .leftJoinAndSelect('tourclassification.tour', 'tour')
            .where('tour.id = :tourId', { tourId: tourclassifications[0].tour.id })
            .getMany();
    }
}