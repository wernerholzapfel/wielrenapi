import {HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Connection, Repository} from 'typeorm';
import { Halloffame } from './halloffame.entity';

@Injectable()
export class HalloffameService {
    private readonly logger = new Logger('Halloffame', true);

    constructor(private readonly connection: Connection,
                @InjectRepository(Halloffame)
                private readonly headlineRepository: Repository<Halloffame>,) {
    }

    async findAll(): Promise<Halloffame[]> {
        const halloffame = await this.connection
            .getRepository(Halloffame)
            .createQueryBuilder('halloffame')
            .orderBy('halloffame.order', "DESC")
            .getMany();

            return halloffame.reduce((result: any, item) => ({
                ...result,
                [item.fameType]: [...(result[item.fameType] || []), item]
              }), {});
    }
}
