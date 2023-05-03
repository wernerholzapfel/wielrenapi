import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Prediction } from './prediction.entity';
import { Connection, DeleteResult, getConnection, Repository } from 'typeorm';
import { Participant } from '../participant/participant.entity';
import { Tour } from '../tour/tour.entity';

@Injectable()
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



    async getPredictionsstate(tourId: string): Promise<any[]> {
        const predictions = await this.connection
            .getRepository(Prediction)
            .createQueryBuilder('prediction')
            .select('participant.id', 'id')
            .addSelect('participant.displayName', 'displayName')
            .addSelect('participant.teamName', 'teamName')
            .addSelect('COUNT(prediction) filter (where prediction.isRider)', 'renners')
            .addSelect('COUNT(prediction) filter (where prediction.isMeesterknecht)', 'meesterknecht')
            .addSelect('COUNT(prediction) filter (where prediction.isBeschermdeRenner)', 'beschermderenner')
            .addSelect('COUNT(prediction) filter (where prediction.isWaterdrager)', 'waterdrager')
            .addSelect('COUNT(prediction) filter (where prediction.isLinkebal)', 'joker')
            .addSelect('COUNT(prediction)', 'totaalRenners')
            .addSelect('SUM("tourrider"."waarde") filter (where prediction.isRider)', 'waardeRenners')
            .addSelect('SUM("tourrider"."waarde") filter (where prediction.isMeesterknecht)', 'waardeMeesterknecht')
            .addSelect('SUM("tourrider"."waarde") filter (where prediction.isBeschermdeRenner)', 'waardeBeschermderenner')
            .addSelect('SUM("tourrider"."waarde") filter (where prediction.isWaterdrager)', 'waardeWaterdrager')
            .addSelect('SUM("tourrider"."waarde") filter (where prediction.isLinkebal)', 'waardeJoker')
            //    .addSelect('SUM(CASE "isRider"\n' +
            //    '        when true then "1"\n' +
            //    '        else 0\n' +
            //    '        end\n' +
            //    '        )', 'totaalWaarde')
            // .addSelect('SUM(CASE "predictionType"\n' +
            //     '        when \'berg\' then "punten"\n' +
            //     '        else 0\n' +
            //     '        end\n' +
            //     '        )', 'bergpunten')
            // .addSelect('SUM(CASE "predictionType"\n' +
            //     '        when \'algemeen\' then "punten"\n' +
            //     '        else 0\n' +
            //     '        end\n' +
            //     '        )', 'algemeenpunten')
            // .addSelect('SUM(CASE "predictionType"\n' +
            //     '        when \'punten\' then "punten"\n' +
            //     '        else 0\n' +
            //     '        end\n' +
            //     '        )', 'puntenpunten')
            // .addSelect('SUM(CASE "predictionType"\n' +
            //     '        when \'jongeren\' then "punten"\n' +
            //     '        else 0\n' +
            //     '        end\n' +
            //     '        )', 'jongerenpunten')
            // .addSelect('SUM(punten)', 'totaalpunten')
            .leftJoin('prediction.participant', 'participant')
            .leftJoin('prediction.rider', 'tourrider')
            .leftJoin('prediction.tour', 'tour')
            .leftJoin('tourrider.rider', 'rider')
            .leftJoin('tourrider.team', 'team')
            .where('tour.id = :id', { id: tourId })
            .groupBy('participant.id')
            .getRawMany();

        return predictions
    }
    async findByParticipant(email: string, tourId: string): Promise<any[]> {
        const participant = await this.connection
            .getRepository(Participant)
            .createQueryBuilder('participant')
            .where('participant.email = :email', { email: email.toLowerCase() })
            .getOne();

        if (participant) {
            const predictions = await this.connection
                .getRepository(Prediction)
                .createQueryBuilder('prediction')
                .leftJoinAndSelect('prediction.rider', 'tourrider')
                .leftJoinAndSelect('prediction.tour', 'tour')
                .leftJoinAndSelect('tourrider.rider', 'rider')
                .leftJoinAndSelect('tourrider.team', 'team')
                .where('prediction.participant.id = :participantID', { participantID: participant.id })
                .andWhere('tour.id = :id', { id: tourId })
                .orderBy('rider.surName', 'ASC')
                .getMany();

            return [
                ...predictions,
                ...this.setEmptyRiders(predictions),
                this.setEmptyLinkebal(predictions),
                this.setBeschermdeRenner(predictions),
                this.setMeesterknecht(predictions),
                this.setWaterdrager(predictions)
            ]
                .filter(n => n)             // remove null values
                .map((r, i) => {
                    return { ...r, index: i };
                });
        } else {
            this.logger.log('geen participant');
            return [];
        }
    }

    setEmptyLinkebal(predictions: Prediction[]) {
        return !predictions.find(p => p.isLinkebal) ? {
            'isRider': false,
            'isWaterdrager': false,
            'isMeesterknecht': false,
            'isLinkebal': true,
            'isBeschermdeRenner': false,
            'isComplete': false,
            'rider': {
                'rider': {
                    'firstName': 'Kies Joker',
                },
            }
        } : null;
    }

    setWaterdrager(predictions: Prediction[]) {
        return !predictions.find(p => p.isWaterdrager) ? {
            'isRider': false,
            'isWaterdrager': true,
            'isMeesterknecht': false,
            'isLinkebal': false,
            'isBeschermdeRenner': false,
            'isComplete': false,
            'rider': {
                'rider': {
                    'firstName': 'Kies Waterdrager',
                },
            }
        } : null;
    }

    setMeesterknecht(predictions: Prediction[]) {
        return !predictions.find(p => p.isMeesterknecht) ? {
            'isRider': false,
            'isWaterdrager': false,
            'isMeesterknecht': true,
            'isLinkebal': false,
            'isBeschermdeRenner': false,
            'isComplete': false,
            'rider': {
                'rider': {
                    'firstName': 'Kies Meesterknecht',
                },
            }
        } : null;
    }

    setBeschermdeRenner(predictions: Prediction[]) {
        return !predictions.find(p => p.isBeschermdeRenner) ? {
            'isRider': false,
            'isWaterdrager': false,
            'isMeesterknecht': false,
            'isLinkebal': false,
            'isBeschermdeRenner': true,
            'isComplete': false,
            'rider': {
                'rider': {
                    'firstName': 'Kies Beschermderenner',
                },
            }
        } : null;
    }

    setEmptyRiders(predictions: Prediction[]) {
        this.logger.log('setEmptyRiders');
        const riders = [];
        const numberOfRiders = 11 - predictions.filter(p => p.isRider).length;
        for (let i = 0; i < numberOfRiders; i++) {
            // Iterate over numeric indexes from 0 to 5, as everyone expects.
            riders.push({
                'isRider': true,
                'isWaterdrager': false,
                'isMeesterknecht': false,
                'isLinkebal': false,
                'isBeschermdeRenner': false,
                'isComplete': false,
                'rider': {
                    'rider': {
                        'firstName': 'Kies Renner',
                    },
                }
            });
        }
        return riders;
    }

    async create(body: any, email: string, displayName: string): Promise<Prediction[]> {
        this.logger.log(email);
        const predictions: Prediction[] = [...body.riders, body.beschermdeRenner, body.linkebal, body.meesterknecht, body.waterdrager];
        this.logger.log('lengte van predictions ' + predictions.length);
        let participant = await this.connection
            .getRepository(Participant)
            .createQueryBuilder('participant')
            .where('participant.email = :email', { email: email.toLowerCase() })
            .getOne();

        if (!participant) {
            await getConnection()
                .createQueryBuilder()
                .insert()
                .into(Participant)
                .values([
                    { email: email.toLowerCase(), displayName: displayName }
                ])
                .execute().then(async response => {
                    participant = await this.connection
                        .getRepository(Participant)
                        .createQueryBuilder('participant')
                        .where('participant.email = :email', { email: email.toLowerCase() })
                        .getOne();
                });
        }

        this.logger.log('hij is opgeslagen:' + participant.id);

        const oldPrediction = await this.connection
            .getRepository(Prediction)
            .createQueryBuilder('prediction')
            .leftJoin('prediction.participant', 'participant')
            .leftJoin('prediction.tour', 'tour')
            .leftJoinAndSelect('prediction.rider', 'rider')
            .where('participant.id = :participantId', { participantId: participant.id })
            .andWhere('tour.id = :tourId', { tourId: body.tour.id })
            .getMany();

        this.logger.log('oldPrediction length: ' + oldPrediction.length);
        await oldPrediction.forEach(async prediction => {

            this.logger.log('oldPrediction delete foreach: ' + prediction.id);

            return await this.connection
                .getRepository(Prediction)
                .createQueryBuilder()
                .delete()
                .from(Prediction, 'prediction')
                .where('id = :id', { id: prediction.id })
                .execute();
        });

        await predictions.forEach(async prediction => {
            if (prediction) {
                const value: Prediction = Object.assign({
                    rider: prediction.rider,
                    isRider: prediction.isRider,
                    isBeschermdeRenner: prediction.isBeschermdeRenner,
                    isLinkebal: prediction.isLinkebal,
                    isMeesterknecht: prediction.isMeesterknecht,
                    isWaterdrager: prediction.isWaterdrager,
                    isComplete: prediction.isComplete,
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
            }
        });

        return await this.connection
            .getRepository(Prediction)
            .createQueryBuilder('prediction')
            .leftJoin('prediction.participant', 'participant')
            .leftJoinAndSelect('prediction.rider', 'rider')
            .where('participant.id = :id', { id: participant.id })
            .getMany();
    }

    async createPrediction(body: { prediction: any, tour: Tour }, email: string, displayName: string): Promise<Prediction> {
        this.logger.log(email);
        let participant = await this.connection
            .getRepository(Participant)
            .createQueryBuilder('participant')
            .where('participant.email = :email', { email: email.toLowerCase() })
            .getOne();

        if (!participant) {
            await getConnection()
                .createQueryBuilder()
                .insert()
                .into(Participant)
                .values([
                    { email: email.toLowerCase(), displayName: displayName }
                ])
                .execute().then(async response => {
                    participant = await this.connection
                        .getRepository(Participant)
                        .createQueryBuilder('participant')
                        .where('participant.email = :email', { email: email.toLowerCase() })
                        .getOne();
                });
        }

        let predictions = await this.connection
            .getRepository(Prediction)
            .createQueryBuilder('prediction')
            .leftJoin('prediction.participant', 'participant')
            .leftJoin('prediction.tour', 'tour')
            .leftJoinAndSelect('prediction.rider', 'rider')
            .where('prediction.participant.id = :participantID', { participantID: participant.id })
            .andWhere('tour.id = :id', { id: body.tour.id })
            .getMany();

        if (body.prediction.isRider &&
            predictions.filter(p => p.isRider).length === 11) {
            throw new HttpException({
                message: 'Je hebt al 11 renners. Refresh de pagina',
                statusCode: HttpStatus.FORBIDDEN,
            }, HttpStatus.FORBIDDEN);
        }

        if (body.prediction.isMeesterknecht &&
            predictions.filter(p => p.isMeesterknecht).length === 1) {
            throw new HttpException({
                message: 'Je hebt al een meesterknecht. Refresh de pagina',
                statusCode: HttpStatus.FORBIDDEN,
            }, HttpStatus.FORBIDDEN);
        }
        
        if (body.prediction.isBeschermdeRenner &&
            predictions.filter(p => p.isBeschermdeRenner).length === 1) {
            throw new HttpException({
                message: 'Je hebt al een beschermde renner. Refresh de pagina',
                statusCode: HttpStatus.FORBIDDEN,
            }, HttpStatus.FORBIDDEN);
        }

        if (body.prediction.isLinkebal &&
            predictions.filter(p => p.isLinkebal).length === 1) {
            throw new HttpException({
                message: 'Je hebt al een joker. Refresh de pagina',
                statusCode: HttpStatus.FORBIDDEN,
            }, HttpStatus.FORBIDDEN);
        }

        if (body.prediction.isWaterdrager &&
            predictions.filter(p => p.isWaterdrager).length === 1) {
            throw new HttpException({
                message: 'Je hebt al een waterdrager. Refresh de pagina',
                statusCode: HttpStatus.FORBIDDEN,
            }, HttpStatus.FORBIDDEN);
        }

        if ((body.prediction.isMeesterknecht
            && !!predictions.find(p => p.isBeschermdeRenner)
            && body.prediction.rider.waarde !=
            predictions.find(p => p.isBeschermdeRenner).rider.waarde) ||
            (body.prediction.isBeschermdeRenner
                && !!predictions.find(p => p.isMeesterknecht)
             && body.prediction.rider.waarde !=
            predictions.find(p => p.isMeesterknecht).rider.waarde)) {
            throw new HttpException({
                message: 'Je meesterknecht en beschermderenner hebben niet dezelfde waarde. Refresh de pagina en probeer opnieuw.',
                statusCode: HttpStatus.FORBIDDEN,
            }, HttpStatus.FORBIDDEN);
        }

        const value: Prediction = Object.assign({
            rider: body.prediction.rider,
            isRider: body.prediction.isRider,
            isBeschermdeRenner: body.prediction.isBeschermdeRenner,
            isLinkebal: body.prediction.isLinkebal,
            isMeesterknecht: body.prediction.isMeesterknecht,
            isWaterdrager: body.prediction.isWaterdrager,
            isComplete: body.prediction.isComplete,
            tour: body.tour,
            participant
        });
        return await this.predictionRepository.save(value)
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }

    async delete(predictionId: string, email: string): Promise<DeleteResult> {
        const participant = await this.connection
            .getRepository(Participant)
            .createQueryBuilder('participant')
            .where('participant.email = :email', { email: email.toLowerCase() })
            .getOne();

        return await this.connection
            .getRepository(Prediction)
            .createQueryBuilder()
            .delete()
            .from(Prediction, 'prediction')
            .where('id = :predictionId', { predictionId })
            .andWhere('participant.id = :participantId', { participantId: participant.id })
            .execute();
    }
}
