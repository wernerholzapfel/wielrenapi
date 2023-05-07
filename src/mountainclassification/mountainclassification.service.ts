import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Mountainclassification } from './mountainclassification.entity';
import { Connection, getConnection, Repository } from 'typeorm';

@Injectable()
export class MountainclassificationService {
    constructor(@InjectRepository(Mountainclassification)
    private readonly mountainclassificationRepository: Repository<Mountainclassification>,
        private readonly connection: Connection,) {
    }

    async findByTourId(tourId): Promise<Mountainclassification[]> {
        return await this.connection
            .getRepository(Mountainclassification)
            .createQueryBuilder('mountainclassification')
            .leftJoinAndSelect('mountainclassification.tourrider', 'tourrider')
            .leftJoinAndSelect('tourrider.rider', 'rider')
            .leftJoinAndSelect('mountainclassification.tour', 'tour')
            .where('tour.id = :tourId', { tourId })
            .orderBy("mountainclassification.position", "ASC")
            .getMany();
    }

    async create(mountainclassifications: Mountainclassification[]): Promise<Mountainclassification[]> {

        await this.mountainclassificationRepository
            .createQueryBuilder()
            .delete()
            .from(Mountainclassification, 'scf')
            .where('tour.id = :tourId', { tourId: mountainclassifications[0].tour.id })
            .execute();

        await this.mountainclassificationRepository
            .createQueryBuilder()
            .insert()
            .into(Mountainclassification)
            .values(mountainclassifications)
            .execute()

        return await this.connection
            .getRepository(Mountainclassification)
            .createQueryBuilder('mountainclassification')
            .leftJoinAndSelect('mountainclassification.tourrider', 'rider')
            .leftJoinAndSelect('mountainclassification.tour', 'tour')
            .where('tour.id = :tourId', { tourId: mountainclassifications[0].tour.id })
            .getMany();
    }
}