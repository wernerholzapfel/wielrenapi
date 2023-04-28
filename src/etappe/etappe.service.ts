import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Etappe} from './etappe.entity';
import {Connection, Repository} from 'typeorm';
import {CreateEtappeDto} from './create-etappe.dto';

@Injectable()
export class EtappeService {
    constructor(@InjectRepository(Etappe)
                private readonly etappeRepository: Repository<Etappe>,
                private readonly connection: Connection,) {
    }

    async findAll(tourId: string): Promise<Etappe[]> {
        return await this.connection
            .getRepository(Etappe)
            .createQueryBuilder('etappe')
            .leftJoin('etappe.tour', 'tour')
            .where('tour.id = :id', {id: tourId})
            .orderBy('etappe.date')
            .getMany();
    }

    async findByEtappe(etappeId: string): Promise<Etappe> {
        return await this.connection
            .getRepository(Etappe)
            .createQueryBuilder('etappe')
            .leftJoinAndSelect('etappe.stageclassifications', 'stageclassifications')
            .leftJoinAndSelect('stageclassifications.tourrider', 'tourrider')
            .leftJoinAndSelect('tourrider.rider', 'rider')
            .where('etappe.id = :id', {id: etappeId})
            .getOne();
    }

    async create(etappe: CreateEtappeDto): Promise<Etappe> {
        return await this.etappeRepository.save(etappe)
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }
}