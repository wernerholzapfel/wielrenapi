import {Component, HttpException, HttpStatus, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Prediction} from './prediction.entity';
import {Connection, getConnection, Repository} from 'typeorm';
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

    async findByParticipant(email: string, tourId: string): Promise<Prediction[]> {
        let participant = await this.connection
            .getRepository(Participant)
            .createQueryBuilder('participant')
            .where('participant.email = :email', {email})
            .getOne();

        if (participant) {
            return await this.connection
                .getRepository(Prediction)
                .createQueryBuilder('prediction')
                .leftJoinAndSelect('prediction.rider', 'tourrider')
                .leftJoinAndSelect('prediction.tour', 'tour')
                .leftJoinAndSelect('tourrider.rider', 'rider')
                .leftJoinAndSelect('tourrider.team', 'team')
                .where('prediction.participant.id = :participantID', {participantID: participant.id})
                .andWhere('tour.id = :id', {id: tourId})
                .getMany();
        } else {
            return [];
        }
    }

    async create(body: any, email: string, displayName: string): Promise<Prediction[]> {
        this.logger.log(email);
        const predictions: Prediction[] = [...body.riders, body.beschermdeRenner, body.linkebal, body.meesterknecht, body.waterdrager]
        this.logger.log('lengte van predictions ' + predictions.length);
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

        this.logger.log('hij is opgeslagen:' + participant.id);

        const oldPrediction = await this.connection
            .getRepository(Prediction)
            .createQueryBuilder('prediction')
            .leftJoin('prediction.participant', 'participant')
            .leftJoinAndSelect('prediction.rider', 'rider')
            .where('participant.id = :id', {id: participant.id})
            .getMany();

        this.logger.log('oldPrediction length: ' + oldPrediction.length);
        await oldPrediction.forEach(async prediction => {

            this.logger.log('oldPrediction delete foreach: ' + prediction.id);

            return await this.connection
                .getRepository(Prediction)
                .createQueryBuilder()
                .delete()
                .from(Prediction, 'prediction')
                .where('id = :id', {id: prediction.id})
                .execute();
        });

        await predictions.forEach(async prediction => {
            const value: Prediction = Object.assign({
                rider: prediction.rider,
                isRider: prediction.isRider,
                isBeschermdeRenner: prediction.isBeschermdeRenner,
                isLinkebal: prediction.isLinkebal,
                isMeesterknecht: prediction.isMeesterknecht,
                isWaterdrager: prediction.isWaterdrager,
                tour: body.tour,
                participant: participant
            });
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
            .where('participant.id = :id', {id: participant.id})
            .getMany();
    }
}
