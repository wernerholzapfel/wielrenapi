import {HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Connection, Repository} from 'typeorm';
import { Career } from './career.entity';

@Injectable()
export class CareerService {
    private readonly logger = new Logger('Halloffame', true);

    constructor(private readonly connection: Connection,
                @InjectRepository(Career)
                private readonly careerRepository: Repository<Career>,) {
    }

    async findAll(): Promise<Career[]> {
        const career = await this.connection
        .getRepository(Career)
        .createQueryBuilder('career')
        .select('participant.id', 'id')
        .addSelect('participant.displayName', 'displayName')
        .addSelect('participant.teamName', 'teamName')
        .addSelect('count("participant")', 'participations')
        .addSelect('SUM("careerCurrentScore")', 'careerCurrentScore')
        .leftJoin('career.participant', 'participant')
        .groupBy('participant.id')
        .orderBy('"careerCurrentScore"', 'DESC')
        .getRawMany();

        const valueToSortOn = 'careerCurrentScore'
        let previousPosition = 1;

        return career.map((item, index) => {
            if (index > 0 && item && item[valueToSortOn] === career[index - 1][valueToSortOn]) {
                return {
                    ...item,
                    participations: parseInt(item.participations),
                    averageCareerScore: Math.round(item.careerCurrentScore / parseInt(item.participations)),
                    positie: previousPosition,
                };
            } else {
                previousPosition = index + 1;
                return {
                    ...item,
                    participations: parseInt(item.participations),
                    averageCareerScore: Math.round(item.careerCurrentScore / parseInt(item.participations)),
                    positie: index + 1,
                };
            }
        });
    }
}
