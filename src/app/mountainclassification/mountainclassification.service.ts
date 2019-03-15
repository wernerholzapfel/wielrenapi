import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Mountainclassification} from './mountainclassification.entity';
import {Connection, getConnection, Repository} from 'typeorm';

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
            .where('tour.id = :tourId', {tourId})
            .orderBy("mountainclassification.position", "ASC")
            .getMany();
    }

    async create(mountainclassifications: Mountainclassification[]): Promise<Mountainclassification[]> {

        const oldSC = await this.connection
            .getRepository(Mountainclassification)
            .createQueryBuilder('tourcf')
            .leftJoin('tourcf.tour', 'tour')
            .where('tour.id = :tourId', {tourId: mountainclassifications[0].tour.id})
            .getMany();

        await oldSC.forEach(async scf => {
            await this.connection
                .getRepository(Mountainclassification)
                .createQueryBuilder()
                .delete()
                .from(Mountainclassification, 'scf')
                .where('id = :id', {id: scf.id})
                .execute();
        });

        await mountainclassifications.forEach(async tourClassificiation => {
            await this.mountainclassificationRepository.save(tourClassificiation)
                .catch((err) => {
                    throw new HttpException({
                        message: err.message,
                        statusCode: HttpStatus.BAD_REQUEST,
                    }, HttpStatus.BAD_REQUEST);
                });
        });

        return await this.connection
            .getRepository(Mountainclassification)
            .createQueryBuilder('mountainclassification')
            .leftJoinAndSelect('mountainclassification.tourrider', 'rider')
            .leftJoinAndSelect('mountainclassification.tour', 'tour')
            .where('tour.id = :tourId', {tourId: mountainclassifications[0].tour.id})
            .getMany();
    }
}