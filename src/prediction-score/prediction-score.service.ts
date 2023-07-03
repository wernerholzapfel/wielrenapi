import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Stageclassification, StageClassificationRead } from '../stageclassification/stageclassification.entity';
import { Etappe } from '../etappe/etappe.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Participant } from '../participant/participant.entity';
import { PredictionEnum, PredictionScore } from './prediction-score.entity';
import { Prediction } from '../prediction/prediction.entity';
import { Tourclassification } from '../tourclassification/tourclassification.entity';
import { Mountainclassification } from '../mountainclassification/mountainclassification.entity';
import { Pointsclassification } from '../pointsclassification/pointsclassification.entity';
import { Youthclassification } from '../youthclassification/youthclassification.entity';
import { Tourriders } from '../tourriders/tourriders.entity';
import { Tour } from '../tour/tour.entity';
import { parse } from 'url';

@Injectable()
export class PredictionScoreService {

    private readonly logger = new Logger('PredictionScoreService', true);

    constructor(@InjectRepository(PredictionScore)
    private readonly repository: Repository<PredictionScore>,
        private readonly connection: Connection,) {

        // const tourId = 'ccdb55e4-c42b-4095-b4e4-c0958dcee6e6'
        // this.updateAlleEtappes(tourId);

        // this.updatePredictionScoreAlgemeen(tourId).then(response => {
        //     this.logger.log(response);
        // });

        // this.updatePredictionScoreBerg(tourId).then(response => {
        //     this.logger.log(response);
        // });
        // this.updatePredictionScorePunten(tourId).then(response => {
        //     this.logger.log(response);
        // });
        // this.updatePredictionScoreJongeren(tourId).then(response => {
        //     this.logger.log(response);
        // });
        // this.getEtappeStand('037445ab-29b3-4841-bed9-920018b4295b').then(response => {
        //     this.logger.log(response);
        // })
        // this.updatePredictionScoreEtappe('169eec18-1a62-407a-804d-fe3db719de67','ad756953-cb34-48bb-bbea-4dd52b993598').then(response => {
        //     this.logger.log(response);
        // });
    }

    private sorteerStand(stand: any, valueToSortOn: string) {
        let previousPosition = 1;
        let previousPositionVorigeStand = 1;
        const vorigeStand = [...stand].sort((a, b) => {
            return (parseInt(b[valueToSortOn], 10) - parseInt(b.deltapunten, 10))
                - (parseInt(a[valueToSortOn], 10) - parseInt(a.deltapunten, 10));
        });

        const standMetvorigePositie = vorigeStand.map((item, index) => {
            if (index > 0 &&
                item &&
                (parseInt(item[valueToSortOn], 10) - parseInt(item.deltapunten, 10)) ===
                (parseInt(vorigeStand[index - 1][valueToSortOn], 10) - parseInt(vorigeStand[index - 1].deltapunten, 10))) {
                return {
                    ...item,
                    etappepunten: parseInt(item.etappepunten, 10),
                    algemeenpunten: parseInt(item.algemeenpunten, 10),
                    bergpunten: parseInt(item.bergpunten, 10),
                    puntenpunten: parseInt(item.puntenpunten, 10),
                    jongerenpunten: parseInt(item.jongerenpunten, 10),
                    totaalpunten: parseInt(item.totaalpunten, 10),
                    deltapunten: parseInt(item.deltapunten, 10),
                    vorigepositie: previousPositionVorigeStand,
                };
            } else {
                previousPositionVorigeStand = index + 1;
                return {
                    ...item,
                    etappepunten: parseInt(item.etappepunten, 10),
                    algemeenpunten: parseInt(item.algemeenpunten, 10),
                    bergpunten: parseInt(item.bergpunten, 10),
                    puntenpunten: parseInt(item.puntenpunten, 10),
                    jongerenpunten: parseInt(item.jongerenpunten, 10),
                    totaalpunten: parseInt(item.totaalpunten, 10),
                    deltapunten: parseInt(item.deltapunten, 10),
                    vorigepositie: index + 1,
                };
            }
        });

        const sortedStand = [...standMetvorigePositie].sort((a, b) => {
            return b[valueToSortOn] - a[valueToSortOn];
        }
        );

        return sortedStand.map((item, index) => {
            if (index > 0 && item && item[valueToSortOn] === sortedStand[index - 1][valueToSortOn]) {
                return {
                    ...item,
                    positie: previousPosition,
                };
            } else {
                previousPosition = index + 1;
                return {
                    ...item,
                    positie: index + 1,
                };
            }
        });
    }

    private sorteerPrediction(prediction: any, valueToSortOn: string) {
        const mappedPrediction = prediction.map((item, index) => {
            return {
                ...item,
                etappepunten: item.etappepunten ? parseInt(item.etappepunten, 10) : 0,
                deltaEtappepunten: item.deltaEtappepunten ? parseInt(item.deltaEtappepunten, 10) : 0,
                algemeenpunten: item.algemeenpunten ? parseInt(item.algemeenpunten, 10) : 0,
                bergpunten: item.bergpunten ? parseInt(item.bergpunten, 10) : 0,
                puntenpunten: item.puntenpunten ? parseInt(item.puntenpunten, 10) : 0,
                jongerenpunten: item.jongerenpunten ? parseInt(item.jongerenpunten, 10) : 0,
                totaalpunten: item.totaalpunten ? parseInt(item.totaalpunten, 10) : 0,
            };
        });

        return [...mappedPrediction].sort((a, b) => {
            return b[valueToSortOn] - a[valueToSortOn];
        });
    }

    async updateAlleEtappes(tourId: string): Promise<any> {
        const etappes = await this.connection
            .getRepository(Etappe)
            .createQueryBuilder('etappe')
            .leftJoin('etappe.tour', 'tour')
            .where('tour.id = :tourId', { tourId })
            .getMany();

        for (const etappe of etappes) {
            this.logger.log(etappe.id + ': start');
            await this.updatePredictionScoreEtappe(etappe.id, tourId).then(result => {
                this.logger.log(etappe.id + ': done');
            });
        }
    }

    async getTotaalStand(tourId): Promise<any[]> {
        const tour = await this.connection.getRepository(Tour)
            .createQueryBuilder('tour')
            .where('tour.id= :tourId', { tourId })
            .getOne();

        const latestEtappe = await this.getLatestEtappe(tourId);

        let stand = await this.connection
            .getRepository(PredictionScore)
            .createQueryBuilder('predictionscore')
            .select('participant.id', 'id')
            .addSelect('participant.displayName', 'displayName')
            .addSelect('participant.teamName', 'teamName')
            .addSelect('SUM(CASE "predictionType"\n' +
                '        when \'etappe\' then "punten"\n' +
                '        else 0\n' +
                '        end\n' +
                '        )', 'etappepunten')
            .addSelect('SUM(CASE "predictionType"\n' +
                '        when \'berg\' then "punten"\n' +
                '        else 0\n' +
                '        end\n' +
                '        )', 'bergpunten')
            .addSelect('SUM(CASE "predictionType"\n' +
                '        when \'algemeen\' then "punten"\n' +
                '        else 0\n' +
                '        end\n' +
                '        )', 'algemeenpunten')
            .addSelect('SUM(CASE "predictionType"\n' +
                '        when \'punten\' then "punten"\n' +
                '        else 0\n' +
                '        end\n' +
                '        )', 'puntenpunten')
            .addSelect('SUM(CASE "predictionType"\n' +
                '        when \'jongeren\' then "punten"\n' +
                '        else 0\n' +
                '        end\n' +
                '        )', 'jongerenpunten')
            .addSelect('SUM(punten)', 'totaalpunten')
            .addSelect((subQuery) => {
                return subQuery.select('SUM("punten")', 'deltapunten')
                    .from(PredictionScore, 'pssub')
                    .where('"etappeId" = :etappeId', { etappeId: latestEtappe ? latestEtappe.id : '7ba32936-e9da-11ed-a05b-0242ac120003' })
                    .andWhere('pssub."participantId" = "participant".id')
                    .groupBy('"participantId"');
            }, 'deltapunten')
            .leftJoin('predictionscore.participant', 'participant')
            .where('"tourId" = :tourId', { tourId })
            .groupBy('participant.id')
            .orderBy('totaalpunten', 'DESC')
            .getRawMany();

        stand = tour.hasEnded ? stand : stand.map(line => {
            return {
                ...line,
                totaalpunten: line.etappepunten
            }
        });
        return this.sorteerStand(stand, 'totaalpunten');
    }

    async getTotaalStandForParticipant(tourId, participantId): Promise<any> {
        const stand = await this.getTotaalStand(tourId)

        return stand.find(line => line.id === participantId);
    }

    async getTeamForParticipant(tourId, participantId): Promise<any> {
        this.logger.log(`getTeamForParticipant ${tourId}, ${participantId}`)
        const tour = await this.connection.getRepository(Tour)
            .createQueryBuilder('tour')
            .where('tour.id= :tourId', { tourId })
            .getOne();

        this.logger.log(`tour ${tourId}, ${participantId}`)

        const latestEtappe = await this.getLatestEtappe(tourId);

        this.logger.log(`latestEtappe ${latestEtappe.id}`)

        let team = await this.connection
            .getRepository(Prediction)
            .createQueryBuilder('prediction')
            .select('prediction', 'prediction')
            .addSelect('participant.id', 'id')
            .addSelect('participant.displayName', 'displayName')
            .addSelect('participant.teamName', 'teamName')
            .addSelect('latestEtappe.etappeNumber', 'tourrider_latestEtappeNumber')
            .addSelect((subQuery) => {
                return subQuery.select('SUM("punten")', 'totaal')
                    .from(PredictionScore, 'pssub')
                    .where('pssub."predictionId" = prediction.id')
                    .groupBy('"predictionId"');
            }, 'totaalpunten')
            .addSelect((subQuery) => {
                return subQuery.select('SUM("punten")', 'algemeen')
                    .from(PredictionScore, 'pssub')
                    .where('pssub."predictionId" = prediction.id')
                    .andWhere('pssub.predictionType = :predictionTypeAlgemeen', { predictionTypeAlgemeen: PredictionEnum.ALGEMEEN })
                    .groupBy('"predictionId"');
            }, 'algemeenpunten')
            .addSelect((subQuery) => {
                return subQuery.select('SUM("punten")', 'etappe')
                    .from(PredictionScore, 'pssub')
                    .where('pssub."predictionId" = prediction.id')
                    .andWhere('pssub.predictionType = :predictionTypeEtappe', { predictionTypeEtappe: PredictionEnum.ETAPPE })
                    .groupBy('"predictionId"');
            }, 'etappepunten')
            .addSelect((subQuery) => {
                return subQuery.select('SUM("punten")', 'deltaEtappe')
                    .from(PredictionScore, 'pssub')
                    .where('pssub."predictionId" = prediction.id')
                    .andWhere('pssub.predictionType = :predictionTypeEtappe', { predictionTypeEtappe: PredictionEnum.ETAPPE })
                    .andWhere('pssub."etappeId" = :latestEtappeId', { latestEtappeId: latestEtappe.id })
                    .groupBy('"predictionId"');
            }, 'deltaEtappepunten')
            .addSelect((subQuery) => {
                return subQuery.select('SUM("punten")', 'punten')
                    .from(PredictionScore, 'pssub')
                    .where('pssub."predictionId" = prediction.id')
                    .andWhere('pssub.predictionType = :predictionTypePunten', { predictionTypePunten: PredictionEnum.PUNTEN })
                    .groupBy('"predictionId"');
            }, 'puntenpunten')

            .addSelect((subQuery) => {
                return subQuery.select('SUM("punten")', 'berg')
                    .from(PredictionScore, 'pssub')
                    .where('pssub."predictionId" = prediction.id')
                    .andWhere('pssub.predictionType = :predictionTypeBerg', { predictionTypeBerg: PredictionEnum.BERG })
                    .groupBy('"predictionId"');
            }, 'bergpunten')
            .addSelect((subQuery) => {
                return subQuery.select('SUM("punten")', 'jongeren')
                    .from(PredictionScore, 'pssub')
                    .where('pssub."predictionId" = prediction.id')
                    .andWhere('pssub.predictionType = :predictionTypeJongeren', { predictionTypeJongeren: PredictionEnum.JONGEREN })
                    .groupBy('"predictionId"');
            }, 'jongerenpunten')
            .leftJoin('prediction.predictionScore', 'predictionscore')
            .leftJoin('predictionscore.participant', 'participant')
            .leftJoinAndSelect('prediction.rider', 'tourrider')
            .leftJoinAndSelect('tourrider.rider', 'rider')
            .leftJoin('tourrider.latestEtappe', 'latestEtappe')
            .where('prediction."tourId" = :tourId', { tourId })
            .andWhere('prediction."participantId" = :participantId', { participantId })
            .groupBy('participant.id, prediction.id, tourrider.id, rider.id, latestEtappe.etappeNumber')
            .orderBy('totaalpunten', 'DESC')
            .getRawMany();

        team = tour.hasEnded ? team : team.map(line => {
            return {
                ...line,
                totaalpunten: line.etappepunten
            }
        });
        this.logger.log(team.length);
        return this.sorteerPrediction(team, 'tourrider_waarde');
    }

    async getLatestEtappe(tourId): Promise<Etappe | any> {
        const latestEtappe = await this.connection
            .getRepository(Etappe).createQueryBuilder('etappe')
            .where('tour.id= :tourId', { tourId })
            .andWhere('etappe.isDriven')
            .leftJoin('etappe.tour', 'tour')
            .orderBy('etappe.etappeNumber', 'DESC')
            .getOne();

        return latestEtappe ? latestEtappe : { id: '7ba32936-e9da-11ed-a05b-0242ac120003' }
    }

    async getLatestEtappeStand(tourId): Promise<any[]> {
        const latestEtappe = await this.getLatestEtappe(tourId);
        return latestEtappe ? this.getEtappeStand(latestEtappe.id) : [];
    }

    async getEtappeStand(etappeId): Promise<any[]> {
        const stand = await this.connection
            .getRepository(PredictionScore)
            .createQueryBuilder('predictionscore')
            .select('participant.id', 'id')
            .addSelect('participant.displayName', 'displayName')
            .addSelect('participant.teamName', 'teamName')
            .addSelect('SUM(predictionscore.punten)', 'totalStagePoints')
            .leftJoin('predictionscore.participant', 'participant')
            .leftJoin('predictionscore.etappe', 'etappe')
            .where('etappe.id = :etappeId', { etappeId })
            .groupBy('participant.id')
            .addGroupBy('etappe.id')
            .getRawMany();

        const sortedStand = this.sorteerStand(stand, 'totalStagePoints');
        const participants =
            await this.connection
                .getRepository(Participant)
                .createQueryBuilder('participant')
                .select('participant.id', 'id')
                .leftJoinAndSelect('participant.predictions', 'predictions')
                .leftJoin('predictions.tour', 'tour')
                .where('tour.id = :tourId', { tourId: '260d2387-4e73-41ad-95f2-80975811c7ca' })
                .getMany()

        this.logger.log(participants)
        return sortedStand.map(stand => {
            return {
                ...stand,
                participant: participants.find(p => p.id === stand.id)
            }
        })

    }

    async getAlgemeenStand(tourId): Promise<any[]> {
        return await this.connection
            .getRepository(PredictionScore)
            .createQueryBuilder('predictionscore')
            .select('SUM(predictionscore.punten)', 'totaalpunten')
            .leftJoinAndSelect('predictionscore.participant', 'participant')
            .leftJoin('predictionscore.tour', 'tour')
            .where('tour.id = :tourId', { tourId })
            .andWhere('predictionscore.predictionType = :predictionType', { predictionType: PredictionEnum.ALGEMEEN })
            .groupBy('participant.id')
            .orderBy('totaalpunten', 'DESC')
            .getRawMany();
    }

    async getBergStand(tourId): Promise<any[]> {
        return await this.connection
            .getRepository(PredictionScore)
            .createQueryBuilder('predictionscore')
            .select('SUM(predictionscore.punten)', 'totaalpunten')
            .leftJoinAndSelect('predictionscore.participant', 'participant')
            .leftJoin('predictionscore.tour', 'tour')
            .where('tour.id = :tourId', { tourId: tourId })
            .andWhere('predictionscore.predictionType = :predictionType', { predictionType: PredictionEnum.BERG })
            .groupBy('participant.id')
            .orderBy('totaalpunten', 'DESC')
            .getRawMany();
    }

    async getPuntenStand(tourId): Promise<any[]> {
        return await this.connection
            .getRepository(PredictionScore)
            .createQueryBuilder('predictionscore')
            .select('SUM(predictionscore.punten)', 'totaalpunten')
            .leftJoinAndSelect('predictionscore.participant', 'participant')
            .leftJoin('predictionscore.tour', 'tour')
            .where('tour.id = :tourId', { tourId: tourId })
            .andWhere('predictionscore.predictionType = :predictionType', { predictionType: PredictionEnum.PUNTEN })
            .groupBy('participant.id')
            .orderBy('totaalpunten', 'DESC')
            .getRawMany();
    }

    async getJongerenStand(tourId): Promise<any[]> {
        return await this.connection
            .getRepository(PredictionScore)
            .createQueryBuilder('predictionscore')
            .select('SUM(predictionscore.punten)', 'totaalpunten')
            .leftJoinAndSelect('predictionscore.participant', 'participant')
            .leftJoin('predictionscore.tour', 'tour')
            .where('tour.id = :tourId', { tourId: tourId })
            .andWhere('predictionscore.predictionType = :predictionType', { predictionType: PredictionEnum.JONGEREN })
            .groupBy('participant.id')
            .orderBy('totaalpunten', 'DESC')
            .getRawMany();
    }

    async getTotalEtappePointsForParticipant(tourId, participantId): Promise<any[]> {
        return await this.connection
            .getRepository(PredictionScore)
            .createQueryBuilder('predictionscore')
            .select('SUM(predictionscore.punten)', 'totaalpunten')
            .leftJoinAndSelect('predictionscore.prediction', 'prediction')
            .leftJoin('predictionscore.participant', 'participant')
            .leftJoin('predictionscore.tour', 'tour')
            .where('tour.id = :tourId', { tourId })
            .andWhere('predictionscore.predictionType = :predictionType', { predictionType: PredictionEnum.ETAPPE })
            .andWhere('participant.id = :participantId', { participantId })
            .groupBy('prediction.id')
            .orderBy('totaalpunten', 'DESC')
            .getRawMany();

    }
    async getEtappePointsForParticipant(etappeId, tourId, participantId): Promise<any[]> {
        return await this.connection
            .getRepository(PredictionScore)
            .createQueryBuilder('predictionscore')
            .leftJoinAndSelect('predictionscore.prediction', 'prediction')
            .leftJoinAndSelect('prediction.rider', 'tourrider')
            .leftJoinAndSelect('tourrider.rider', 'rider')
            .leftJoinAndSelect('tourrider.latestEtappe', 'latestEtappe')
            .leftJoin('predictionscore.participant', 'participant')
            .leftJoin('predictionscore.tour', 'tour')
            .leftJoin('predictionscore.etappe', 'etappe')
            .where('tour.id = :tourId', { tourId })
            .andWhere('predictionscore.predictionType = :predictionType', { predictionType: PredictionEnum.ETAPPE })
            .andWhere('etappe.id = :etappeId', { etappeId })
            .andWhere('participant.id = :participantId', { participantId })
            .getMany();
    }
    async getPredictionScoresPointsForParticipant(predictionType: PredictionEnum, tourId, participantId): Promise<any[]> {
        return await this.connection
            .getRepository(PredictionScore)
            .createQueryBuilder('predictionscore')
            .leftJoinAndSelect('predictionscore.prediction', 'prediction')
            .leftJoinAndSelect('prediction.rider', 'tourrider')
            .leftJoinAndSelect('tourrider.rider', 'rider')
            .leftJoinAndSelect('tourrider.latestEtappe', 'latestEtappe')
            .leftJoin('predictionscore.participant', 'participant')
            .leftJoin('predictionscore.tour', 'tour')
            .leftJoin('predictionscore.etappe', 'etappe')
            .where('tour.id = :tourId', { tourId })
            .andWhere('predictionscore.predictionType = :predictionType', { predictionType })
            .andWhere('participant.id = :participantId', { participantId })
            .getMany();
    }

    async updatePredictionScoreEtappe(etappeId: string, tourId: string): Promise<any[]> {

        const oldScores = await this.connection
            .getRepository(PredictionScore)
            .createQueryBuilder('predictionscore')
            .leftJoin('predictionscore.etappe', 'etappe')
            .where('etappe.id = :etappeId', { etappeId })
            .getMany();

        // todo improve
        await oldScores.forEach(async oldscore => {
            await this.connection
                .getRepository(PredictionScore)
                .createQueryBuilder()
                .delete()
                .from(PredictionScore, 'predictionscore')
                .where('id = :id', { id: oldscore.id })
                .execute();
        });

        const uitvallers = await this.connection
            .getRepository(Tourriders)
            .createQueryBuilder('tourriders')
            .leftJoin('tourriders.latestEtappe', 'latestEtappe')
            .where('latestEtappe.id = :latestEtappeId', { latestEtappeId: etappeId })
            .getMany();

        const predictions = await this.connection
            .getRepository(Prediction)
            .createQueryBuilder('prediction')
            .leftJoinAndSelect('prediction.participant', 'participant')
            .leftJoinAndSelect('prediction.rider', 'tourrider')
            .leftJoinAndSelect('tourrider.team', 'team')
            .leftJoinAndSelect('tourrider.latestEtappe', 'latestEtappe')
            .leftJoin('prediction.tour', 'tour')
            .where('tour.id = :tourId', { tourId })
            .getMany();

        const stageclassifications = await this.connection
            .getRepository(Stageclassification)
            .createQueryBuilder('stageclassification')
            .leftJoinAndSelect('stageclassification.tourrider', 'tourrider')
            .leftJoinAndSelect('tourrider.team', 'team')
            .leftJoin('stageclassification.etappe', 'etappe')
            .leftJoin('stageclassification.tour', 'tour')
            .where('etappe.id = :etappeId', { etappeId })
            .getMany();

        const tourriderIds: string[] = stageclassifications.map(sc => sc.tourrider.id);
        const filteredPredictions = predictions.filter(p => {
            return tourriderIds.indexOf(p.rider.id) > -1 || p.isWaterdrager || uitvallers && uitvallers.find(uitvaller => uitvaller.id === p.rider.id);
        });
        const predictionScore: any[] = filteredPredictions.map(prediction => {
            const sc = stageclassifications.find(sc => sc && sc.tourrider.id === prediction.rider.id);
            return {
                punten: this.determinePunten(sc, stageclassifications, prediction, etappeFactor, true, uitvallers),
                participant: { id: prediction.participant.id },
                tour: { id: tourId },
                prediction: { id: prediction.id },
                predictionType: PredictionEnum.ETAPPE,
                etappe: { id: etappeId },
                stageClassification: { id: sc ? sc.id : null }
            };
        });

        await this.connection
            .createQueryBuilder()
            .insert()
            .into(PredictionScore)
            .values(predictionScore)
            .execute();

        return [];
    }

    async updatePredictionScoreAlgemeen(tourId: string): Promise<any[]> {

        await this.connection
            .getRepository(PredictionScore)
            .createQueryBuilder()
            .delete()
            .from(PredictionScore, 'predictionscore')
            .where('predictionscore.predictionType = :predictionType', { predictionType: PredictionEnum.ALGEMEEN })
            .andWhere('predictionscore."tourId" = :tourId', { tourId })
            .execute();

        const predictions = await this.connection
            .getRepository(Prediction)
            .createQueryBuilder('prediction')
            .leftJoinAndSelect('prediction.participant', 'participant')
            .leftJoinAndSelect('prediction.rider', 'tourrider')
            .leftJoinAndSelect('tourrider.team', 'team')
            .leftJoin('prediction.tour', 'tour')
            .where('tour.id = :tourId', { tourId })
            .getMany();

        const classifications = await this.connection
            .getRepository(Tourclassification)
            .createQueryBuilder('classification')
            .leftJoinAndSelect('classification.tourrider', 'tourrider')
            .leftJoinAndSelect('tourrider.team', 'team')
            .leftJoin('classification.tour', 'tour')
            .where('tour.id = :tourId', { tourId })
            .getMany();

        const tourriderIds: string[] = classifications.map(sc => sc.tourrider.id);
        const filteredPredictions = predictions.filter(p => {
            return tourriderIds.indexOf(p.rider.id) > -1 || p.isWaterdrager;
        });

        const predictionScore: any[] = filteredPredictions.map(prediction => {
            const sc = classifications.find(sc => sc && sc.tourrider.id === prediction.rider.id);
            return {
                punten: this.determinePunten(sc, classifications, prediction, algemeenFactor, false),
                participant: { id: prediction.participant.id },
                tour: { id: tourId },
                prediction: { id: prediction.id },
                predictionType: PredictionEnum.ALGEMEEN,
            };
        });

        await this.connection
            .createQueryBuilder()
            .insert()
            .into(PredictionScore)
            .values(predictionScore)
            .execute();

        return [];
    }

    async updatePredictionScoreBerg(tourId: string): Promise<any[]> {

        const oldScores = await this.connection
            .getRepository(PredictionScore)
            .createQueryBuilder('predictionscore')
            .where('predictionscore.predictionType = :predictionType', { predictionType: PredictionEnum.BERG })
            .andWhere('predictionscore."tourId" = :tourId', { tourId })
            .getMany();

        await oldScores.forEach(async oldscore => {
            await this.connection
                .getRepository(PredictionScore)
                .createQueryBuilder()
                .delete()
                .from(PredictionScore, 'predictionscore')
                .where('id = :id', { id: oldscore.id })
                .execute();
        });

        const predictions = await this.connection
            .getRepository(Prediction)
            .createQueryBuilder('prediction')
            .leftJoinAndSelect('prediction.participant', 'participant')
            .leftJoinAndSelect('prediction.rider', 'tourrider')
            .leftJoinAndSelect('tourrider.team', 'team')
            .leftJoin('prediction.tour', 'tour')
            .where('tour.id = :tourId', { tourId })
            .getMany();

        const classifications = await this.connection
            .getRepository(Mountainclassification)
            .createQueryBuilder('classification')
            .leftJoinAndSelect('classification.tourrider', 'tourrider')
            .leftJoinAndSelect('tourrider.team', 'team')
            .leftJoin('classification.tour', 'tour')
            .where('tour.id = :tourId', { tourId })
            .getMany();

        const tourriderIds: string[] = classifications.map(sc => sc.tourrider.id);
        const filteredPredictions = predictions.filter(p => {
            return tourriderIds.indexOf(p.rider.id) > -1 || p.isWaterdrager;
        });
        const predictionScore: any[] = filteredPredictions.map(prediction => {
            const sc = classifications.find(sc => sc && sc.tourrider.id === prediction.rider.id);
            return {
                punten: this.determinePunten(sc, classifications, prediction, mountainFactor, false),
                participant: { id: prediction.participant.id },
                tour: { id: tourId },
                prediction: { id: prediction.id },
                predictionType: PredictionEnum.BERG,
            };
        });

        await this.connection
            .createQueryBuilder()
            .insert()
            .into(PredictionScore)
            .values(predictionScore)
            .execute();

        return [];
    }

    async updatePredictionScorePunten(tourId: string): Promise<any[]> {

        const oldScores = await this.connection
            .getRepository(PredictionScore)
            .createQueryBuilder('predictionscore')
            .where('predictionscore.predictionType = :predictionType', { predictionType: PredictionEnum.PUNTEN })
            .andWhere('predictionscore."tourId" = :tourId', { tourId })
            .getMany();

        await oldScores.forEach(async oldscore => {
            await this.connection
                .getRepository(PredictionScore)
                .createQueryBuilder()
                .delete()
                .from(PredictionScore, 'predictionscore')
                .where('id = :id', { id: oldscore.id })
                .execute();
        });

        const predictions = await this.connection
            .getRepository(Prediction)
            .createQueryBuilder('prediction')
            .leftJoinAndSelect('prediction.participant', 'participant')
            .leftJoinAndSelect('prediction.rider', 'tourrider')
            .leftJoinAndSelect('tourrider.team', 'team')
            .leftJoin('prediction.tour', 'tour')
            .where('tour.id = :tourId', { tourId })
            .getMany();

        const classifications = await this.connection
            .getRepository(Pointsclassification)
            .createQueryBuilder('classification')
            .leftJoinAndSelect('classification.tourrider', 'tourrider')
            .leftJoinAndSelect('tourrider.team', 'team')
            .leftJoin('classification.tour', 'tour')
            .where('tour.id = :tourId', { tourId })
            .getMany();

        const tourriderIds: string[] = classifications.map(sc => sc.tourrider.id);
        console.log(tourriderIds);
        const filteredPredictions = predictions.filter(p => {
            return tourriderIds.indexOf(p.rider.id) > -1 || p.isWaterdrager;
        });
        const predictionScore: any[] = filteredPredictions.map(prediction => {
            const sc = classifications.find(sc => sc && sc.tourrider.id === prediction.rider.id);
            return {
                punten: this.determinePunten(sc, classifications, prediction, pointsFactor, false),
                participant: { id: prediction.participant.id },
                tour: { id: tourId },
                prediction: { id: prediction.id },
                predictionType: PredictionEnum.PUNTEN,
            };
        });

        await this.connection
            .createQueryBuilder()
            .insert()
            .into(PredictionScore)
            .values(predictionScore)
            .execute();

        return [];
    }

    async updatePredictionScoreJongeren(tourId: string): Promise<any[]> {

        const oldScores = await this.connection
            .getRepository(PredictionScore)
            .createQueryBuilder('predictionscore')
            .where('predictionscore.predictionType = :predictionType', { predictionType: PredictionEnum.JONGEREN })
            .andWhere('predictionscore."tourId" = :tourId', { tourId })
            .getMany();

        await oldScores.forEach(async oldscore => {
            await this.connection
                .getRepository(PredictionScore)
                .createQueryBuilder()
                .delete()
                .from(PredictionScore, 'predictionscore')
                .where('id = :id', { id: oldscore.id })
                .execute();
        });

        const predictions = await this.connection
            .getRepository(Prediction)
            .createQueryBuilder('prediction')
            .leftJoinAndSelect('prediction.participant', 'participant')
            .leftJoinAndSelect('prediction.rider', 'tourrider')
            .leftJoinAndSelect('tourrider.team', 'team')
            .leftJoin('prediction.tour', 'tour')
            .where('tour.id = :tourId', { tourId })
            .getMany();

        const classifications = await this.connection
            .getRepository(Youthclassification)
            .createQueryBuilder('classification')
            .leftJoinAndSelect('classification.tourrider', 'tourrider')
            .leftJoinAndSelect('tourrider.team', 'team')
            .leftJoin('classification.tour', 'tour')
            .where('tour.id = :tourId', { tourId })
            .getMany();

        this.logger.log(predictions.length);
        this.logger.log(classifications.length);

        const tourriderIds: string[] = classifications.map(sc => sc.tourrider.id);
        console.log(tourriderIds);
        const filteredPredictions = predictions.filter(p => {
            return tourriderIds.indexOf(p.rider.id) > -1 || p.isWaterdrager;
        });
        this.logger.log(filteredPredictions.length);
        const predictionScore: any[] = filteredPredictions.map(prediction => {
            const sc = classifications.find(sc => sc && sc.tourrider.id === prediction.rider.id);
            return {
                punten: this.determinePunten(sc, classifications, prediction, youthFactor, false),
                participant: { id: prediction.participant.id },
                tour: { id: tourId },
                prediction: { id: prediction.id },
                predictionType: PredictionEnum.JONGEREN,
            };
        });

        await this.connection
            .createQueryBuilder()
            .insert()
            .into(PredictionScore)
            .values(predictionScore)
            .execute();

        return [];
    }

    determinePunten(sc: Stageclassification, stageClassifications: Stageclassification[], prediction: Prediction, factor: number, isStageCF, uitvallers?: Tourriders[]) {
        const predictionIsOutAtThisStage = uitvallers && uitvallers.find(uitvaller => uitvaller.id === prediction.rider.id);
        if (prediction.isRider) {
            if (predictionIsOutAtThisStage) {
                return didNotFinishPoints;
            } else {
                return this.calculatePoints(sc, factor);
            }
        }
        if (prediction.isBeschermdeRenner) {
            if (predictionIsOutAtThisStage) {
                return didNotFinishPoints * 2;
            } else {
                return this.calculatePoints(sc, factor);
            }
        }
        if (prediction.isMeesterknecht) {
            if (predictionIsOutAtThisStage) {
                return -1 * prediction.rider.waarde;
            } else {
                return -1 * this.calculatePoints(sc, factor);
            }
        }
        if (prediction.isLinkebal) {
            if (predictionIsOutAtThisStage) {
                return didNotFinishPoints;
            } else {
                return 2 * this.calculatePoints(sc, factor);
            }
        }
        if (prediction.isWaterdrager) {
            const waterdragerTeamSC = stageClassifications.filter(item => item.tourrider.team.id === prediction.rider.team.id);
            const waterdragerSC = stageClassifications.find(item => item.tourrider.id === prediction.rider.id);
            const teampunten: number = waterdragerTeamSC
                .reduce((totalPoints, stageCF) => {
                    return totalPoints + this.calculatePoints(stageCF, factor);
                }, 0);
            const waterdragerpunten = this.calculatePoints(waterdragerSC, factor);

            if (prediction.participant.id === 'f1dc0b79-28cc-4ede-8212-4742aee882f7') {
                waterdragerTeamSC.forEach(item => this.logger.log(item.tourrider.id));
                this.logger.log(waterdragerpunten);
                this.logger.log(teampunten);
            }
            return predictionIsOutAtThisStage ?
                isStageCF ?
                    0 :
                    prediction.rider.waarde * -1
                : isStageCF ?
                    Math.round((teampunten - waterdragerpunten) / 7) - waterdragerpunten :
                    Math.round((teampunten - waterdragerpunten) / 7) - waterdragerpunten - prediction.rider.waarde;
            // todo 7 uit een property halen ergens? + correcte formule hanteren teampunten /8 + waterdragerpunten
        }
    }

    calculatePoints(sc: any, factor: number) {
        if (sc && sc.position) {
            return eval('etappe' + sc.position) * factor;
        }
        return 0;
    }
}

const etappe1 = 60;
const etappe2 = 52;
const etappe3 = 44;
const etappe4 = 38;
const etappe5 = 34;
const etappe6 = 30;
const etappe7 = 28;
const etappe8 = 26;
const etappe9 = 24;
const etappe10 = 22;
const etappe11 = 20;
const etappe12 = 18;
const etappe13 = 16;
const etappe14 = 14;
const etappe15 = 12;
const etappe16 = 10;
const etappe17 = 8;
const etappe18 = 6;
const etappe19 = 4;
const etappe20 = 2;
const didNotFinishPoints = -20;

const etappeFactor = 1;
const algemeenFactor = 2.5;
const mountainFactor = 2;
const youthFactor = 1.5;
const pointsFactor = 2;
