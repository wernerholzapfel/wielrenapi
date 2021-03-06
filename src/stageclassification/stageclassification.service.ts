import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Stageclassification} from './stageclassification.entity';
import {Connection, Repository} from 'typeorm';
import {Etappe} from '../etappe/etappe.entity';

@Injectable()
export class StageclassificationService {
    constructor(@InjectRepository(Stageclassification)
                private readonly stageclassificationRepository: Repository<Stageclassification>,
                private readonly connection: Connection,) {
    }

    async findByEtappeId(etappeId): Promise<Stageclassification[]> {
        return await this.connection
            .getRepository(Stageclassification)
            .createQueryBuilder('stageclassification')
            .leftJoinAndSelect('stageclassification.tourrider', 'tourrider')
            .leftJoinAndSelect('tourrider.rider', 'rider')
            .leftJoinAndSelect('stageclassification.etappe', 'etappe')
            .where('etappe.id = :etappeId', {etappeId})
            .orderBy('stageclassification.position', 'ASC')
            .getMany();
    }

    async create(stageclassifications: Stageclassification[]): Promise<Stageclassification[]> {

        const oldSC = await this.connection
            .getRepository(Stageclassification)
            .createQueryBuilder('stagecf')
            .leftJoin('stagecf.etappe', 'etappe')
            .where('etappe.id = :etappeId', {etappeId: stageclassifications[0].etappe.id})
            .getMany();

        await oldSC.forEach(async scf => {
            await this.connection
                .getRepository(Stageclassification)
                .createQueryBuilder()
                .delete()
                .from(Stageclassification, 'scf')
                .where('id = :id', {id: scf.id})
                .execute();
        });

        await stageclassifications.forEach(async stageClassificiation => {
            await this.stageclassificationRepository.save(stageClassificiation)
                .catch((err) => {
                    throw new HttpException({
                        message: err.message,
                        statusCode: HttpStatus.BAD_REQUEST,
                    }, HttpStatus.BAD_REQUEST);
                });
        });
        await this.connection
            .createQueryBuilder()
            .update(Etappe)
            .set({isDriven: true})
            .where('id = :id', {id: stageclassifications[0].etappe.id})
            .execute();

        return await this.connection
            .getRepository(Stageclassification)
            .createQueryBuilder('stageclassification')
            .leftJoinAndSelect('stageclassification.tourrider', 'rider')
            .leftJoinAndSelect('stageclassification.tour', 'tour')
            .leftJoinAndSelect('stageclassification.etappe', 'etappe')
            .where('etappe.id = :etappeId', {etappeId: stageclassifications[0].etappe.id})
            .getMany();
    }
}