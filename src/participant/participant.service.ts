import {CACHE_MANAGER, HttpException, HttpStatus, Inject, Injectable, Logger} from '@nestjs/common';
import {Participant, ParticipantRead} from './participant.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Connection, Repository} from 'typeorm';
import {Stageclassification, StageClassificationRead} from '../stageclassification/stageclassification.entity';
import {Prediction, PredictionRead} from '../prediction/prediction.entity';
import {Team} from '../teams/team.entity';
import {Etappe} from '../etappe/etappe.entity';
import {Cache} from 'cache-manager'
// Import Admin SDK
import * as admin from 'firebase-admin';
import {Tourclassification} from '../tourclassification/tourclassification.entity';
import {CreateParticipantDto} from './create-participant.dto';
import {Tourriders, TourridersRead} from '../tourriders/tourriders.entity';
import {Tour} from '../tour/tour.entity';

// Get a database reference
@Injectable()
export class ParticipantService {
    private readonly logger = new Logger('ParticipantService', true);


    constructor(@InjectRepository(Participant)
                private readonly participantRepository: Repository<Participant>,
                private readonly connection: Connection,
                @Inject(CACHE_MANAGER) private cacheManager: Cache) {
    }

    async loggedIn(email: string): Promise<Participant> {
        return await this.connection
            .getRepository(Participant)
            .createQueryBuilder('participant')
            .where('participant.email = :email', {email: email.toLowerCase()})
            .getOne();
    }

    async findAll(tourId): Promise<Participant[]> {
        return await this.connection
            .getRepository(Participant)
            .createQueryBuilder('participant')
            .leftJoinAndSelect('participant.predictions', 'predictions')
            .leftJoinAndSelect('predictions.rider', 'tourrider')
            .leftJoinAndSelect('tourrider.rider', 'rider')
            .leftJoin('predictions.tour', 'tour')
            .where('tour.id = :id', {id: tourId})
            .getMany();
    }

    async getTeamClassifications(tourId: string): Promise<Team[]> {
        return await this.connection
            .getRepository(Team)
            .createQueryBuilder('team')
            .leftJoinAndSelect('team.tour', 'tour')
            .leftJoinAndSelect('team.tourRiders', 'tourRiders')
            .leftJoin('tourRiders.tour', 'tourRidersTour')
            .leftJoinAndSelect('tourRiders.stageclassifications', 'sc')
            .leftJoinAndSelect('tourRiders.tourclassifications', 'tc')
            .leftJoinAndSelect('tourRiders.mountainclassifications', 'mc')
            .leftJoinAndSelect('tourRiders.youthclassifications', 'yc')
            .leftJoinAndSelect('tourRiders.pointsclassifications', 'pc')
            .leftJoinAndSelect('sc.etappe', 'etappe')
            .where('tour.id = :id', {id: tourId})
            .andWhere('tourRidersTour.id = :id', {id: tourId})
            .getMany();

    }

    async getDrivenEtappes(tourId: string): Promise<Etappe[]> {
        return await this.connection
            .getRepository(Etappe)
            .createQueryBuilder('etappe')
            .leftJoinAndSelect('etappe.tour', 'tour')
            .where('tour.id = :id', {id: tourId})
            .andWhere('etappe.isDriven')
            .getMany();

    }

    async getLatestEtappe(tourId: string): Promise<any[]> {
        const etappe = await this.connection
            .getRepository(Etappe)
            .createQueryBuilder('etappe')
            .leftJoin('etappe.tour', 'tour')
            .leftJoinAndSelect('etappe.stageclassifications', 'stageclassifications')
            .leftJoinAndSelect('stageclassifications.tourrider', 'tourrider')
            .leftJoinAndSelect('tourrider.rider', 'rider')
            .where('tour.id = :id', {id: tourId})
            .andWhere('etappe.isDriven')
            .orderBy('etappe.etappeNumber', 'DESC')
            .getOne();

        return await this.getEtappe(tourId, etappe && etappe.id ? etappe.id : null);
    }

    async getEtappe(tourId: string, etappeId): Promise<any[]> {

        // this.logger.log('tourId:' + tourId + 'etappeId: ' + etappeId);
        const participants: any = await this.connection
            .getRepository(Participant)
            .createQueryBuilder('participant')
            .leftJoinAndSelect('participant.predictions', 'predictions')
            .leftJoinAndSelect('predictions.rider', 'tourrider')
            .leftJoinAndSelect('tourrider.rider', 'rider')
            .leftJoinAndSelect('tourrider.team', 'team')
            .leftJoinAndSelect('tourrider.latestEtappe', 'latestEtappe')
            .leftJoinAndSelect('tourrider.stageclassifications', 'stageclassifications')
            .leftJoinAndSelect('stageclassifications.etappe', 'scetappe', 'scetappe.id = :scEtappeId', {scEtappeId: etappeId})
            .leftJoin('predictions.tour', 'tour')
            .where('tour.id = :id', {id: tourId})
            .getMany();

        const teams: Team[] = await this.getTeamClassifications(tourId);
        const etappes: Etappe[] = await this.getDrivenEtappes(tourId);
        const tour: Tour = await this.connection
            .getRepository(Tour)
            .createQueryBuilder('tour')
            .where('tour.id = :id', {id: tourId})
            .getOne();
        let previousPosition = 1;

        participants.map(participant => {
            // this.logger.log('aantal predictions voor: ' + participant.displayName + ' is ' + participant.predictions.length);
            [...participant.predictions]
                .map(prediction => {
                    if (prediction.isWaterdrager) {
                        const newStageClassifications: Stageclassification[] = this.determineWDPunten(prediction, etappes, teams, etappeFactor);
                        prediction.rider.stageclassifications = [...newStageClassifications.filter(sc => sc.etappe.id === etappeId)];
                    } else {
                        prediction.rider.stageclassifications =
                            [...prediction.rider.stageclassifications.filter(sc => sc.etappe && sc.etappe.id === etappeId)]
                                .map(sc =>
                                    Object.assign(sc, {stagePoints: this.determinePunten(sc, prediction, etappeFactor)})
                                );
                        if (prediction.rider.isOut && prediction.rider.latestEtappe.id === etappeId && !prediction.isWaterdrager) {
                            prediction.rider.stageclassifications.push({
                                stagePoints: prediction.isBeschermdeRenner ?
                                    this.determineBeschermdeRennerIsOutPunten(tour.scoreTable) :
                                    !prediction.isMeesterknecht ? didNotFinishPoints : (-1 * prediction.rider.waarde),
                                etappe: prediction.rider.latestEtappe,
                            });
                        }
                    }
                    Object.assign(prediction, {totalStagePoints: this.determineSCTotaalpunten(prediction)});

                });
            Object.assign(participant, {totalStagePoints: this.determinePredictionsTotalPoints(participant, false)});
        });

        participants.sort((a, b) => {
            return b.totalStagePoints - a.totalStagePoints;
        });

        // assign position
        participants.map((participant, index) => {
            if (index > 0 && participant.totalStagePoints === participants[index - 1].totalStagePoints) {
                Object.assign(participant, {position: previousPosition});
            } else {
                Object.assign(participant, {position: index + 1});
                previousPosition = index + 1;
            }
        });

        return participants;
    }

    async getTourRider(tourriderId: string): Promise<any> {
        // todo ook ander punten toevoegen?
        const tourrider: TourridersRead = await this.connection
            .getRepository(Tourriders)
            .createQueryBuilder('tourrider')
            .leftJoinAndSelect('tourrider.rider', 'rider')
            .leftJoinAndSelect('tourrider.predictions', 'tourriderpredicted')
            .leftJoinAndSelect('tourriderpredicted.participant', 'participanthaspredicted')
            // .leftJoinAndSelect('tourrider.team', 'team')
            .leftJoinAndSelect('tourrider.latestEtappe', 'latestEtappe')
            .leftJoinAndSelect('tourrider.stageclassifications', 'stageclassifications')
            // .leftJoinAndSelect('tourrider.tourclassifications', 'tourclassifications')
            // .leftJoinAndSelect('tourrider.mountainclassifications', 'mountainclassifications')
            // .leftJoinAndSelect('tourrider.youthclassifications', 'youthclassifications')
            // .leftJoinAndSelect('tourrider.pointsclassifications', 'pointsclassifications')
            .leftJoinAndSelect('stageclassifications.etappe', 'etappe')
            .where('tourrider.id = :id', {id: tourriderId})
            .getOne();

        tourrider.stageclassifications.map(sc => {
            sc.stagePoints = this.calculatePoints(sc, 1);
        });

        return tourrider;
    }

    async invalidateCacheAndSetLastUpdated(tourId): Promise<void> {

        await this.cacheManager.reset()
        const db = admin.database();
        const ref = db.ref(tourId);

        const lastUpdated = ref.child('lastUpdated');
        lastUpdated.set({tour: tourId, lastUpdated: Date.now()});

        admin.messaging().sendToDevice(
            'cTBoX8_6BEqBnGTMPSqNwf:APA91bFZtbbfIElGBikmrJ2lh5h2yjhoy9gSK9wsheqsYnsCNH2R6-37vEVuKXZnXmswRK79HvSd75babtTEx4ySGSPOqOVPRDnM3jrZGOvLfHqq5GJjDLQ5Hs6TlFuZjyXYaJSX1T-2',
            {
                notification: {
                    title: 'Het Wielerspel',
                    body: 'De stand is geupdate'
                }
            }).then(response => {
            this.logger.log(response);
        }).catch(err => {
            this.logger.log(err);
        });
        return;
    }

    async getTable(tourId: string): Promise<any[]> {

        const participants: ParticipantRead[] = await this.connection
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
            .where('tour.id = :id', {id: tourId})
            .getMany();

        const teams: Team[] = await this.getTeamClassifications(tourId);
        const etappes: Etappe[] = await this.getDrivenEtappes(tourId);
        const tour: any = etappes.length > 0 ? etappes[0].tour : {id: tourId, hasEnded: false};
        let previousPosition = 1;

        participants.map(participant => {
            [...participant.predictions]
                .map(prediction => {
                    if (prediction.isWaterdrager) {
                        const newStageClassifications: StageClassificationRead[] = this.determineWDPunten(prediction, etappes, teams, etappeFactor);
                        prediction.rider.stageclassifications = [...newStageClassifications];
                        Object.assign(prediction, {tourPoints: this.determineWDTourPunten(prediction, teams, tourFactor)});
                        Object.assign(prediction, {mountainPoints: this.determineWDMountainPunten(prediction, teams, mountainFactor)});
                        Object.assign(prediction, {youthPoints: this.determineWDYouthPunten(prediction, teams, youthFactor)});
                        Object.assign(prediction, {pointsPoints: this.determineWDPointsPunten(prediction, teams, pointsFactor)});
                    } else {
                        prediction.rider.stageclassifications =
                            [...prediction.rider.stageclassifications]
                                .map(sc =>
                                    Object.assign(sc, {stagePoints: this.determinePunten(sc, prediction, etappeFactor)})
                                );
                        if (prediction.rider.isOut && !prediction.isWaterdrager) {
                            prediction.rider.stageclassifications.push({
                                stagePoints: prediction.isBeschermdeRenner ?
                                    this.determineBeschermdeRennerIsOutPunten(tour.scoreTable) :
                                    !prediction.isMeesterknecht ? didNotFinishPoints : (-1 * prediction.rider.waarde),
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
                    Object.assign(prediction, {totalStagePoints: this.determineSCTotaalpunten(prediction)});
                    Object.assign(prediction, {deltaStagePoints: this.determineDeltaScTotalpoints(prediction, teams, etappes)});

                });
            Object.assign(participant, {totalPoints: this.determinePredictionsTotalPoints(participant, tour.hasEnded)});
            Object.assign(participant, {totalStagePoints: this.determinePredictionsTotalPoints(participant, false)});
            Object.assign(participant, {totalTourPoints: this.determineTotalTourPoints(participant.predictions)});
            Object.assign(participant, {totalMountainPoints: this.determineTotalMountainPoints(participant.predictions)});
            Object.assign(participant, {totalYouthPoints: this.determineTotalYouthPoints(participant.predictions)});
            Object.assign(participant, {totalPointsPoints: this.determineTotalPointsPoints(participant.predictions)});
            Object.assign(participant, {deltaTotalStagePoints: this.determineDeltaTotalstagePoints(participant, tour.hasEnded)});
            Object.assign(participant, {previousTotalPoints: (participant.totalPoints - participant.deltaTotalStagePoints)});
        });

        participants.sort((a, b) => {
            return b.previousTotalPoints - a.previousTotalPoints;
        }).map((participant, index) => {
            if (index > 0 && participant.previousTotalPoints === participants[index - 1].previousTotalPoints) {
                Object.assign(participant, {previousPosition});
            } else {
                Object.assign(participant, {previousPosition: index + 1});
                previousPosition = index + 1;
            }
        });

        participants.sort((a, b) => {
            return b.totalPoints - a.totalPoints;
        }).map((participant, index) => {
            if (index > 0 && participant.totalPoints === participants[index - 1].totalPoints) {
                Object.assign(participant, {position: previousPosition});
            } else {
                Object.assign(participant, {position: index + 1});
                previousPosition = index + 1;
            }
        });


        const db = admin.database();
        const ref = db.ref(tourId);

        const standRef = ref.child('stand');
        standRef.set(participants);
        // const lastUpdated = ref.child('lastUpdated');
        // lastUpdated.set({tour: tourId, lastUpdated: Date.now()});

        // admin.messaging().sendToDevice(
        //     'emwL9z2ezkaCtJJJ8Q7zba:APA91bEusyrxdBokagifRMLHDyornA0cvUDA9dhtJI0Soa8laZNXqCanoKMVizqOe4T5HbRMJtZ_nOxm51Vu_VNc8iTqACqsSzEujJPsYQomH7mTp_ot1nyHB3hvkxT_0FfMmUBprHfl',
        //     {
        //         notification: {
        //             title: 'Het Wielerspel',
        //             body: 'De stand is geupdate'
        //         }
        //     }).then(response => {
        //     this.logger.log(response);
        // }).catch(err => {
        //     this.logger.log(err);
        // });

        return participants;
    }


    async create(participant: CreateParticipantDto, email: string): Promise<Participant> {
        const newParticipant: Participant = Object.assign(participant);
        newParticipant.email = email.toLowerCase();
        return await this.participantRepository.save(newParticipant)
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }

    determinePredictionsTotalPoints(participant: ParticipantRead, hasEnded: boolean) {
        if (hasEnded) {
            return participant.predictions.reduce((totalPoints, prediction) => {
                // this.logger.log('determinePredictionsTotalPoints: ' + totalPoints);
                return totalPoints +
                    this.getZeroValueIfUndefined(prediction.totalStagePoints) +
                    this.getZeroValueIfUndefined(prediction.youthPoints) +
                    this.getZeroValueIfUndefined(prediction.mountainPoints) +
                    this.getZeroValueIfUndefined(prediction.tourPoints) +
                    this.getZeroValueIfUndefined(prediction.pointsPoints);
            }, 0);
        } else {
            return participant.predictions.reduce((totalPoints, prediction) => {
                // this.logger.log('determinePredictionsTotalPoints: ' + totalPoints);
                return totalPoints +
                    this.getZeroValueIfUndefined(prediction.totalStagePoints);
            }, 0);
        }

    }

    getZeroValueIfUndefined(points: number) {
        return points ? points : 0;
    }

    determineWDTourPunten(prediction: Prediction, teams: Team[], factor: number) {
        if (prediction.rider.isOut) {
            return -1 * prediction.rider.waarde;
        }
        const team = teams.find(item => item.id === prediction.rider.team.id);

        const totalTeampoints = team.tourRiders
            .map(teamRider => teamRider.tourclassifications
                .reduce((totalPoints, tc) => {
                    return totalPoints + this.calculatePoints(tc, factor);
                }, 0))
            .reduce((acc, value) => {
                return acc + value;
            });

        const classification: Tourclassification = team.tourRiders
            .find(tourrider => tourrider.id === prediction.rider.id).tourclassifications[0];

        const riderPoints = classification ? this.calculatePoints(classification, factor) : 0;

        return Math.round(((totalTeampoints - riderPoints) / (team.tourRiders.length - 1)) -
            riderPoints - prediction.rider.waarde);

    }

    determineWDMountainPunten(prediction: Prediction, teams: Team[], factor: number) {
        if (prediction.rider.isOut) {
            return -1 * prediction.rider.waarde;
        }
        const team = teams.find(item => item.id === prediction.rider.team.id);

        const totalTeampoints = team.tourRiders
            .map(teamRider => teamRider.mountainclassifications
                .reduce((totalPoints, tc) => {
                    return totalPoints + this.calculatePoints(tc, factor);
                }, 0))
            .reduce((acc, value) => {
                return acc + value;
            });

        const classification: any = team.tourRiders.find(tourrider => tourrider.id === prediction.rider.id).mountainclassifications[0];

        const riderPoints = classification ? this.calculatePoints(classification, factor) : 0;

        return Math.round(((totalTeampoints - riderPoints) / (team.tourRiders.length - 1)) -
            riderPoints - prediction.rider.waarde);

    }

    determineWDYouthPunten(prediction: Prediction, teams: Team[], factor: number) {
        if (prediction.rider.isOut) {
            return -1 * prediction.rider.waarde;
        }
        const team = teams.find(item => item.id === prediction.rider.team.id);

        const totalTeampoints = team.tourRiders
            .map(teamRider => teamRider.youthclassifications
                .reduce((totalPoints, tc) => {
                    return totalPoints + this.calculatePoints(tc, factor);
                }, 0))
            .reduce((acc, value) => {
                return acc + value;
            });

        const classification: any = team.tourRiders.find(tourrider => tourrider.id === prediction.rider.id).youthclassifications[0];

        const riderPoints = classification ? this.calculatePoints(classification, factor) : 0;

        return Math.round(((totalTeampoints - riderPoints) / (team.tourRiders.length - 1)) -
            riderPoints - prediction.rider.waarde);

    }

    determineWDPointsPunten(prediction: Prediction, teams: Team[], factor: number) {
        if (prediction.rider.isOut) {
            return -1 * prediction.rider.waarde;
        }
        const team = teams.find(item => item.id === prediction.rider.team.id);

        const totalTeampoints = team.tourRiders
            .map(teamRider => teamRider.pointsclassifications
                .reduce((totalPoints, tc) => {
                    return totalPoints + this.calculatePoints(tc, factor);
                }, 0))
            .reduce((acc, value) => {
                return acc + value;
            });

        const classification: any = team.tourRiders.find(tourrider => tourrider.id === prediction.rider.id).pointsclassifications[0];

        const riderPoints = classification ? this.calculatePoints(classification, factor) : 0;

        return Math.round(((totalTeampoints - riderPoints) / (team.tourRiders.length - 1)) -
            riderPoints - prediction.rider.waarde);

    }

    determineWDPunten(prediction: Prediction, etappes: Etappe[], teams: Team[], etappeFactor: number) {
        const newStageCF = etappes.map(etappe => {
            const etappePosition = this.determinePositionInEtappe(etappe, prediction);
            return {id: null, position: etappePosition, etappe};
        });

        const team = teams.find(item => item.id === prediction.rider.team.id);

        newStageCF.forEach(newStage => {
            const totalTeampoints = team.tourRiders
                .map(teamRider => teamRider.stageclassifications
                    .reduce((totalPoints, sc) => {
                        if (sc.etappe && sc.etappe.id === newStage.etappe.id && (!prediction.rider.latestEtappe ||
                            (prediction.rider.latestEtappe && sc.etappe.etappeNumber < prediction.rider.latestEtappe.etappeNumber))) {
                            return totalPoints + this.calculatePoints(sc, etappeFactor);
                        } else {
                            return totalPoints;
                        }
                    }, 0))
                .reduce((acc, value) => {
                    return acc + value;
                });

            // this.logger.log('totalteampoints wd: ' + prediction.rider.rider.surName + ' ' + totalTeampoints);
            const riderPoints = newStage.position ? this.calculatePoints(newStage, etappeFactor) : 0;
            // this.logger.log('riderPoints wd: ' + prediction.rider.rider.surName + ' ' + riderPoints);

            const calculation = '((' + totalTeampoints + '-' + riderPoints + ') / (' + team.tourRiders.length + '-' + 1 + ')) - ' + riderPoints;
            const stagePointsWD = Math.round(((totalTeampoints - riderPoints) / (team.tourRiders.length - 1)) -
                riderPoints);

            // this.logger.log('stagePointsWd: ' + prediction.rider.rider.surName + ' ' + stagePointsWD);
            Object.assign(newStage, {stagePoints: stagePointsWD, calculation});
            return newStage;
        });

        return newStageCF;
    }

    determinePositionInEtappe(etappe: Etappe, prediction: Prediction) {
        return (prediction.rider.stageclassifications.find(sc => sc.etappe && sc.etappe.id === etappe.id)) ?
            prediction.rider.stageclassifications.find(sc => sc.etappe && sc.etappe.id === etappe.id).position : null;
    }

    determineSCTotaalpunten(prediction: PredictionRead) {
        return prediction.rider.stageclassifications.reduce((totalPoints, sc) => {
            return totalPoints + sc.stagePoints;
        }, 0);
    }

    determineTotalTourPoints(predictions: PredictionRead[]) {
        return predictions.reduce((totalPoints, prediction) => {
            return (prediction.tourPoints) ? prediction.tourPoints + totalPoints : totalPoints;
        }, 0);
    }

    determineTotalMountainPoints(predictions: PredictionRead[]) {
        return predictions.reduce((totalPoints, prediction) => {
            return (prediction.mountainPoints) ? prediction.mountainPoints + totalPoints : totalPoints;
        }, 0);
    }

    determineTotalYouthPoints(predictions: PredictionRead[]) {
        return predictions.reduce((totalPoints, prediction) => {
            return (prediction.youthPoints) ? prediction.youthPoints + totalPoints : totalPoints;
        }, 0);
    }

    determineTotalPointsPoints(predictions: PredictionRead[]) {
        return predictions.reduce((totalPoints, prediction) => {
            return (prediction.pointsPoints) ? prediction.pointsPoints + totalPoints : totalPoints;
        }, 0);
    }

    determineDeltaTotalstagePoints(participant: ParticipantRead, hasEnded: boolean) {
        const deltaStagePunten = participant.predictions.reduce((deltaStagePoints, prediction) => {
            return (prediction.deltaStagePoints) ? prediction.deltaStagePoints + deltaStagePoints : deltaStagePoints;
        }, 0);

        if (hasEnded) {
            // todo heeft nooit kunnen werken?
            return deltaStagePunten +
                this.getZeroValueIfUndefined(participant.totalYouthPoints) +
                this.getZeroValueIfUndefined(participant.totalMountainPoints) +
                this.getZeroValueIfUndefined(participant.totalTourPoints) +
                this.getZeroValueIfUndefined(participant.totalPointsPoints);
        } else {
            return deltaStagePunten;
        }

    }

    determineDeltaScTotalpoints(prediction: PredictionRead, teams: Team[], stages: Etappe[]) {
        const lastStageNumber: number = Math.max(...stages.filter(stage => stage.isDriven)
            .map(stage => stage.etappeNumber));
        const lastStage = prediction.rider.stageclassifications.find(sc => sc.etappe.etappeNumber === lastStageNumber);
        return lastStage ? lastStage.stagePoints : 0;
    }

    determinePunten(sc: StageClassificationRead, prediction: Prediction, factor: number) {
        if (prediction.isRider) {
            return this.calculatePoints(sc, factor);
        }
        if (prediction.isBeschermdeRenner) {
            return this.calculatePoints(sc, factor);
        }
        if (prediction.isMeesterknecht) {
            if (prediction.rider.isOut && prediction.rider.latestEtappe && sc.etappe && prediction.rider.latestEtappe.id === sc.etappe.id) {
                return -1 * prediction.rider.waarde;
            } else {
                return -1 * this.calculatePoints(sc, factor);
            }
        }
        if (prediction.isLinkebal) {
            return 2 * this.calculatePoints(sc, factor);
        }
        if (prediction.isWaterdrager) {
            return null;
        }
    }

    calculatePoints(sc: any, factor: number) {
        if (sc.position) {
            return eval('etappe' + sc.position) * factor;
        }
        return 0;
    }

    determineBeschermdeRennerIsOutPunten(scoreTable: number) {
        switch (scoreTable) {
            case 1:
                return 0;
            case 2:
                return -40;
            default:
                return 0;
        }
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
const tourFactor = 2.5;
const mountainFactor = 2;
const youthFactor = 1.5;
const pointsFactor = 2;
