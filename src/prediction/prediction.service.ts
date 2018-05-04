import {Component, HttpException, HttpStatus, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Prediction} from './prediction.entity';
import {Connection, getConnection, Repository} from 'typeorm';
import {CreatePredictionDto} from './create-prediction.dto';
import {Participant} from '../participant/participant.entity';

@Component()
export class PredictionService {
    private readonly logger = new Logger('PredictionService', true);

    constructor(@InjectRepository(Prediction)
                private readonly predictionRepository: Repository<Prediction>,
                private readonly connection: Connection,) {
    }

    async findAll(): Promise<Prediction[]> {
        return await this.connection
            .getRepository(Prediction)
            .createQueryBuilder('prediction')
            .getMany();
    }

    async create(body: CreatePredictionDto, email: string, displayName: string): Promise<Prediction[]> {
        this.logger.log(email);
        const predictions = [...body.riders, body.beschermdeRenner, body.linkebal, body.meesterknecht, body.waterdrager]

        let participant = await this.connection
            .getRepository(Participant)
            .createQueryBuilder('participant')
            .where('participant.email = :email', {email})
            .getOne();

        if (!participant) {
            await getConnection()
                .createQueryBuilder()
                .insert()
                .into(Participant)
                .values([
                    {email: email, displayName: displayName}
                ])
                .execute().then(async response => {
                    participant = await this.connection
                        .getRepository(Participant)
                        .createQueryBuilder('participant')
                        .where('participant.email = :email', {email})
                        .getOne();
                });
        }

        this.logger.log('hij is opgeslagen:' + participant.email);

        const oldPrediction = await this.connection
            .getRepository(Prediction)
            .createQueryBuilder('prediction')
            .leftJoin('prediction.participant', 'participant')
            .leftJoinAndSelect('prediction.rider', 'rider')
            .where('participant.email = :email', {email})
            .getMany();

        await oldPrediction.forEach(async prediction => {
            await this.connection
                .getRepository(Prediction)
                .createQueryBuilder()
                .delete()
                .from(Prediction, 'prediction')
                .where('id = :id', {id: prediction.id})
                .execute();
        });

        await predictions.forEach(async prediction => {
            const value: Prediction = {
                rider: prediction,
                isRider: prediction.isRenner,
                isWaterdrager: prediction.isWaterdrager,
                isLinkebal: prediction.isLinkebal,
                isBeschermdeRenner: prediction.isBeschermdeRenner,
                isMeesterknecht: prediction.isMeesterknecht,
                tour: body.tour,
                participant: participant
            };
            await this.predictionRepository.save(value)
                .catch((err) => {
                    throw new HttpException({
                        message: err.message,
                        statusCode: HttpStatus.BAD_REQUEST,
                    }, HttpStatus.BAD_REQUEST);
                });
        });

        return await this.connection
            .getRepository(Prediction)
            .createQueryBuilder('prediction')
            .leftJoin('prediction.participant', 'participant')
            .leftJoinAndSelect('prediction.rider', 'rider')
            .where('participant.email = :email', {email})
            .getMany();
    }
}
