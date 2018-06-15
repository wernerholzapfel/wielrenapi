import {Component, HttpStatus, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Participant} from './participant.entity';
import {Connection, Repository} from 'typeorm';
import {HttpException} from '@nestjs/core';
import {Stageclassification} from '../stageclassification/stageclassification.entity';
import {Prediction} from '../prediction/prediction.entity';
import {Team} from '../teams/team.entity';
import {Etappe} from '../etappe/etappe.entity';
// Import Admin SDK
import * as admin from 'firebase-admin';

// Get a database reference
@Component()
export class ParticipantService {

    private readonly logger = new Logger('ParticipantService', true);

    constructor(@InjectRepository(Participant)
                private readonly participantRepository: Repository<Participant>,
                private readonly connection: Connection,) {
    }

    async findAll(): Promise<Participant[]> {
        return await this.connection
            .getRepository(Participant)
            .createQueryBuilder('participant')
            .leftJoinAndSelect('participant.predictions', 'predictions')
            .leftJoinAndSelect('predictions.rider', 'tourrider')
            .leftJoinAndSelect('tourrider.rider', 'rider')
            .leftJoin('predictions.tour', 'tour')
            .where('tour.isActive')
            .getMany();
    }

    async getTeamClassifications(): Promise<Team[]> {
        return await this.connection
            .getRepository(Team)
            .createQueryBuilder('team')
            .leftJoinAndSelect('team.tour', 'tour')
            .leftJoinAndSelect('team.tourRiders', 'tourRiders')
            .leftJoinAndSelect('tourRiders.stageclassifications', 'sc')
            .leftJoinAndSelect('sc.etappe', 'etappe')
            .where('tour.isActive')
            .getMany();

    }

    async getDrivenEtappes(): Promise<Etappe[]> {
        return await this.connection
            .getRepository(Etappe)
            .createQueryBuilder('etappe')
            .leftJoinAndSelect('etappe.tour', 'tour')
            .where('tour.isActive')
            .andWhere('etappe.isDriven')
            .getMany();

    }

    async updateTable(): Promise<any[]> {

        const participants = await this.connection
            .getRepository(Participant)
            .createQueryBuilder('participant')
            .leftJoinAndSelect('participant.predictions', 'predictions')
            .leftJoinAndSelect('predictions.rider', 'tourrider')
            .leftJoinAndSelect('tourrider.rider', 'rider')
            .leftJoinAndSelect('tourrider.team', 'team')
            .leftJoinAndSelect('tourrider.latestEtappe', 'latestEtappe')
            .leftJoinAndSelect('tourrider.stageclassifications', 'stageclassifications')
            .leftJoinAndSelect('tourrider.tourclassifications', 'tourclassifications')
            .leftJoinAndSelect('tourrider.mountainclassifications', 'mountainclassifications')
            .leftJoinAndSelect('tourrider.youthclassifications', 'youthclassifications')
            .leftJoinAndSelect('tourrider.pointsclassifications', 'pointsclassifications')
            .leftJoinAndSelect('stageclassifications.etappe', 'etappe')
            .leftJoin('predictions.tour', 'tour')
            .where('tour.isActive')
            .getMany();

        const teams: Team[] = await this.getTeamClassifications();
        const etappes: Etappe[] = await this.getDrivenEtappes();

        participants.map(participant => {
            [...participant.predictions]
                .map(prediction => {
                    if (prediction.isWaterdrager) {
                        const newStageClassifications: Stageclassification[] = this.determineWDPunten(prediction, etappes, teams, etappeFactor);
                        prediction.rider.stageclassifications = [...newStageClassifications];
                    }
                    else {
                        prediction.rider.stageclassifications =
                            [...prediction.rider.stageclassifications]
                                .map(sc =>
                                    Object.assign(sc, {stagePoints: this.determinePunten(sc, prediction, etappeFactor)})
                                );
                        if (prediction.rider.isOut && (!prediction.isWaterdrager || !prediction.isBeschermdeRenner)) {
                            prediction.rider.stageclassifications.push({
                                stagePoints: prediction.rider.isOut ? didNotFinishPoints : 0,
                                etappe: prediction.rider.latestEtappe,
                            });
                        }
                        [...prediction.rider.tourclassifications]
                            .map(tc =>
                                Object.assign(prediction, {tourPoints: this.determinePunten(tc, prediction, tourFactor)})
                            );
                        [...prediction.rider.youthclassifications]
                            .map(yc =>
                                Object.assign(prediction, {youthPoints: this.determinePunten(yc, prediction, youthFactor)})
                            );
                        [...prediction.rider.mountainclassifications]
                            .map(mc =>
                                Object.assign(prediction, {mountainPoints: this.determinePunten(mc, prediction, mountainFactor)})
                            );
                        [...prediction.rider.pointsclassifications]
                            .map(pc =>
                                Object.assign(prediction, {pointsPoints: this.determinePunten(pc, prediction, pointsFactor)})
                            );
                    }
                    Object.assign(prediction, {totalStagePoints: this.determineSCTotaalpunten(prediction, teams, etappes.length)});
                    Object.assign(prediction, {deltaStagePoints: this.determineDeltaScTotalpoints(prediction, teams, etappes)});

                });
            Object.assign(participant, {totalPoints: this.determinePredictionsTotalPoints(participant)});
        });

        const db = admin.database();
        const ref = db.ref('server');

        const standRef = ref.child('stand');
        standRef.set(participants);

        return participants;
        // return stand;
    }

    async create(participant: Participant): Promise<Participant> {
        return await this.participantRepository.save(participant)
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }

    determinePredictionsTotalPoints(participant: Participant) {
        return participant.predictions.reduce((totalPoints, prediction) => {
            this.logger.log('determinePredictionsTotalPoints: ' + totalPoints);
            return totalPoints +
                this.getZeroValueIfUndefined(prediction.totalStagePoints) +
                this.getZeroValueIfUndefined(prediction.youthPoints) +
                this.getZeroValueIfUndefined(prediction.mountainPoints) +
                this.getZeroValueIfUndefined(prediction.tourPoints) +
                this.getZeroValueIfUndefined(prediction.pointsPoints);
        }, 0)
    }

    getZeroValueIfUndefined(points: number) {
        return points ? points : 0;
    }

    determineWDPunten(prediction: Prediction, etappes: Etappe[], teams: Team[], etappeFactor: number) {
        const newStageCF = etappes.map(etappe => {
            const etappePosition = this.determinePositionInEtappe(etappe, prediction);
            return {id: null, position: etappePosition, etappe: etappe};
        });

        const team = teams.find(team => team.id === prediction.rider.team.id);

        newStageCF.forEach(newStage => {
            const totalTeampoints = team.tourRiders
                .map(teamRider => teamRider.stageclassifications
                    .reduce((totalPoints, sc) => {
                        if (sc.etappe && sc.etappe.id === newStage.etappe.id) {
                            return totalPoints + this.calculatePoints(sc, etappeFactor);
                        } else {
                            return totalPoints;
                        }
                    }, 0))
                .reduce((acc, value) => {
                    return acc + value;
                });

            this.logger.log('totalteampoints wd: ' + prediction.rider.rider.surName + ' ' + totalTeampoints);
            const riderPoints = newStage.position ? this.calculatePoints(newStage, etappeFactor) : 0
            this.logger.log('riderPoints wd: ' + prediction.rider.rider.surName + ' ' + riderPoints);

            const stagePointsWD = Math.round(((totalTeampoints - riderPoints) / (team.tourRiders.length - 1)) -
                riderPoints);

            this.logger.log('stagePointsWd: ' + prediction.rider.rider.surName + ' ' + stagePointsWD);
            Object.assign(newStage, {stagePoints: stagePointsWD});
            return newStage;
        });

        return newStageCF;
    }

    determinePositionInEtappe(etappe: Etappe, prediction: Prediction) {
        return (prediction.rider.stageclassifications.find(sc => sc.etappe.id === etappe.id)) ?
            prediction.rider.stageclassifications.find(sc => sc.etappe.id === etappe.id).position : null;
    }

    determineSCTotaalpunten(prediction: Prediction, teams: Team[], NumberOfDrivenEttapes: number) {
        // if (prediction.isWaterdrager) {
        //     const team = teams.find(team => team.id === prediction.rider.team.id);
        //
        //     const totalTeampoints = team.tourRiders
        //         .map(teamRider => teamRider.stageclassifications
        //             .reduce((totalPoints, sc) => {
        //                 if (prediction.rider.isOut && prediction.rider.latestEtappe && prediction.rider.latestEtappe.etappeNumber >= sc.etappe.etappeNumber) {
        //                     return totalPoints;
        //                 } else {
        //                     return totalPoints + this.calculatePoints(sc, etappeFactor);
        //                 }
        //             }, 0))
        //         .reduce((acc, value) => {
        //             return acc + value;
        //         });
        //
        //     this.logger.log('totalTeampoints: ' + team.teamName + ': ' + totalTeampoints);
        //
        //     const riderPoints = prediction.rider.stageclassifications
        //         .reduce((totalPoints, sc) => {
        //             return totalPoints + this.calculatePoints(sc, etappeFactor);
        //         }, 0);
        //
        //     this.logger.log('riderPoints: ' + prediction.rider.rider.surName + ': ' + riderPoints);
        //
        //
        //     const waterDragerPunten = Math.round(((totalTeampoints - riderPoints) / (team.tourRiders.length -1 )) -
        //         riderPoints -
        //         (3 * prediction.rider.waarde / 29 * NumberOfDrivenEttapes));
        //
        //     this.logger.log('waterDragerPunten ' +
        //         prediction.rider.rider.surName + ': ' + waterDragerPunten +
        //         ' waarde: ' + prediction.rider.waarde +
        //         ' NumberOfDrivenEttapes: '
        //         + NumberOfDrivenEttapes);
        //     return waterDragerPunten
        // }
        // else {
        return prediction.rider.stageclassifications.reduce((totalPoints, sc) => {
            return totalPoints + sc.stagePoints;
        }, 0);
        // }
    }

    determineDeltaScTotalpoints(prediction: Prediction, teams: Team[], stages: Etappe[]) {
        const lastStageNumber: Number = Math.max(...stages.filter(stage => stage.isDriven)
            .map(stage => stage.etappeNumber));

        this.logger.log('lastStageNumber: ' + lastStageNumber)
        if (prediction.isWaterdrager) {
            return 0;
        }
        else {
            const lastStage = prediction.rider.stageclassifications.find(sc => sc.etappe.etappeNumber === lastStageNumber);
            return lastStage ? lastStage.stagePoints : 0;
        }
    }

    determinePunten(sc: Stageclassification, prediction: Prediction, factor: number) {
        if (prediction.isRider) {
            return this.calculatePoints(sc, factor)
        }
        if (prediction.isBeschermdeRenner) {
            return this.calculatePoints(sc, factor)
        }
        if (prediction.isMeesterknecht) {
            if (prediction.rider.isOut && prediction.rider.latestEtappe.id === sc.etappe.id) {
                return -1 * prediction.rider.waarde;
            } else {
                return -1 * this.calculatePoints(sc, factor)
            }
        }
        if (prediction.isLinkebal) {
            return 2 * this.calculatePoints(sc, factor)
        }
        if (prediction.isWaterdrager) {
            return null;
        }
    }

    calculatePoints(sc: Stageclassification, factor: number) {
        if (sc.position) {
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
const didNotFinishPoints = -10;

const etappeFactor = 1;
const tourFactor = 2.5;
const mountainFactor = 2;
const youthFactor = 1.5;
const pointsFactor = 2;
