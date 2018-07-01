import {Component, HttpStatus, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Tourriders} from './tourriders.entity';
import {Connection, Repository} from 'typeorm';
import {HttpException} from '@nestjs/core';
import {Tour} from '../tour/tour.entity';
import {Team} from '../teams/team.entity';
import {Etappe} from '../etappe/etappe.entity';
import {Rider} from '../rider/rider.entity';
import {Stageclassification} from '../stageclassification/stageclassification.entity';

@Component()
export class TourridersService {
    private readonly logger = new Logger('TourridersService', true);

    constructor(private readonly connection: Connection,
                @InjectRepository(Tourriders)
                private readonly tourridersRepository: Repository<Tourriders>,) {
    }

    async findActive(): Promise<Tour> {
        return await this.connection
            .getRepository(Tour)
            .createQueryBuilder('tour')
            .leftJoinAndSelect('tour.teams', 'team')
            .leftJoinAndSelect('team.tourRiders', 'teamriders', '(teamriders.tour.id = tour.id OR teamriders.tour.id IS NULL)')
            .leftJoinAndSelect('teamriders.rider', 'rider')
            .where('tour.isActive')
            .andWhere('(teamriders.tour.id = tour.id OR teamriders.tour.id IS NULL)')
            .getOne();
    }

    async getDetails(tourId: string): Promise<Tour> {
        const tourriders = await this.connection
            .getRepository(Tourriders)
            .createQueryBuilder('tourrider')
            .leftJoinAndSelect('tourrider.team', 'team')
            .leftJoinAndSelect('tourrider.rider', 'rider')
            .leftJoin('tourrider.tour', 'tour')
            .leftJoinAndSelect('tourrider.latestEtappe', 'latestEtappe')
            .leftJoinAndSelect('tourrider.stageclassifications', 'stageclassifications')
            .leftJoinAndSelect('tourrider.tourclassifications', 'tourclassifications')
            .leftJoinAndSelect('tourrider.mountainclassifications', 'mountainclassifications')
            .leftJoinAndSelect('tourrider.youthclassifications', 'youthclassifications')
            .leftJoinAndSelect('tourrider.pointsclassifications', 'pointsclassifications')
            .leftJoinAndSelect('stageclassifications.etappe', 'etappe')
            .where('tour.id = :id', {id: tourId})
            .getMany();

        const teams: Team[] = await this.getTeamClassifications(tourId);
        const etappes: Etappe[] = await this.getDrivenEtappes(tourId);


        tourriders.map(rider => {
            rider.stageclassifications =
                [...rider.stageclassifications]
                    .map(sc =>
                        Object.assign(sc, {stagePoints: this.calculatePoints(sc, etappeFactor)})
                    );
            if (rider.isOut) {
                rider.stageclassifications.push({
                    stagePoints: rider.isOut ? didNotFinishPoints : 0,
                    etappe: rider.latestEtappe,
                });
            }
            [...rider.tourclassifications]
                .map(tc =>
                    Object.assign(rider, {tourPoints: this.calculatePoints(tc, tourFactor)})
                );
            [...rider.youthclassifications]
                .map(yc =>
                    Object.assign(rider, {youthPoints: this.calculatePoints(yc, youthFactor)})
                );
            [...rider.mountainclassifications]
                .map(mc =>
                    Object.assign(rider, {mountainPoints: this.calculatePoints(mc, mountainFactor)})
                );
            [...rider.pointsclassifications]
                .map(pc =>
                    Object.assign(rider, {pointsPoints: this.calculatePoints(pc, pointsFactor)})
                );
            Object.assign(rider, {waterdragerPoints: this.determineWDTotaalpunten(rider, teams, etappes.length)});
            Object.assign(rider, {totalStagePoints: this.determineSCTotaalpunten(rider, teams, etappes.length)});
        });
        return tourriders;

    }


    async create(tourriders: Tourriders): Promise<Tourriders> {
        return await this.tourridersRepository.save(tourriders)
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }

    async getTeamClassifications(id: string): Promise<Team[]> {
        return await this.connection
            .getRepository(Team)
            .createQueryBuilder('team')
            .leftJoinAndSelect('team.tour', 'tour')
            .leftJoinAndSelect('team.tourRiders', 'tourRiders')
            .leftJoinAndSelect('tourRiders.stageclassifications', 'sc')
            .leftJoinAndSelect('sc.etappe', 'etappe')
            .where('tour.id = :id', {id})
            .getMany();

    }

    async getDrivenEtappes(id: string): Promise<Etappe[]> {
        return await this.connection
            .getRepository(Etappe)
            .createQueryBuilder('etappe')
            .leftJoinAndSelect('etappe.tour', 'tour')
            .where('tour.id = :id', {id})
            .andWhere('etappe.isDriven')
            .getMany();

    }

    determineWDTotaalpunten(rider: Rider, teams: Team[], NumberOfDrivenEttapes: number) {
        if (NumberOfDrivenEttapes > 0) {
            const team = teams.find(team => team.id === rider.team.id);

            const totalTeamStagePoints = team.tourRiders
                .map(teamrider => teamrider.stageclassifications
                    .reduce((totalPoints, sc) => {
                        if (rider.isOut && rider.latestEtappe && rider.latestEtappe.etappeNumber >= sc.etappe.etappeNumber) {
                            return totalPoints;
                        } else {
                            return totalPoints + this.calculatePoints(sc, etappeFactor);
                        }
                    }, 0))
                .reduce((acc, value) => {
                    return acc + value;
                });

            let totalTeampoints: number = totalTeamStagePoints +
                (team.tourRiders.filter(rider => rider.isOut).length * didNotFinishPoints);

            this.logger.log('totalTeampoints: ' + team.teamName + ': ' + totalTeampoints);

            const riderPoints = rider.stageclassifications
                .reduce((totalPoints, sc) => {
                    return totalPoints + this.calculatePoints(sc, etappeFactor);
                }, 0);

            this.logger.log('riderPoints: ' + rider.rider.surName + ': ' + riderPoints);

            const waterDragerPunten = Math.round(((totalTeampoints - riderPoints) / (team.tourRiders.length - 1)) -
                riderPoints);

            this.logger.log('waterDragerPunten ' +
                rider.rider.surName + ': ' + waterDragerPunten +
                ' waarde: ' + rider.waarde +
                ' NumberOfDrivenEttapes: '
                + NumberOfDrivenEttapes);
            return waterDragerPunten
        }
        else {
            return 0;
        }
    }


    determineSCTotaalpunten(rider: Rider, teams: Team[], NumberOfDrivenEttapes: number) {
        return rider.stageclassifications.reduce((totalPoints, sc) => {
            return totalPoints + sc.stagePoints;
        }, 0);
    }


    // determinePunten(sc: Stageclassification, factor: number) {
    //     if (prediction.isRider) {
    //         return this.calculatePoints(sc, factor)
    //     }
    //     if (prediction.isBeschermdeRenner) {
    //         return this.calculatePoints(sc, factor)
    //     }
    //     if (prediction.isMeesterknecht) {
    //         return -1 * this.calculatePoints(sc, factor)
    //     }
    //     if (prediction.isLinkebal) {
    //         return 2 * this.calculatePoints(sc, factor)
    //     }
    //     if (prediction.isWaterdrager) {
    //         // const team = teams.find(team => team.id === prediction.rider.team.id);
    //         //
    //         // const totalTeampoints = team.tourRiders
    //         //     .map(rider => rider.stageclassifications
    //         //         .reduce((totalPoints, sc) => {
    //         //             return totalPoints + this.calculatePoints(sc);
    //         //         }, 0))
    //         //     .reduce((acc, value) => {
    //         //         return acc + value;
    //         //     });
    //         // this.logger.log('totalTeamPoints: ' + team.teamName + ' - ' + totalTeampoints);
    //         // const riderPoints = this.calculatePoints(sc);
    //         // this.logger.log('riderPoints: ' + prediction.rider.rider.surName + riderPoints);
    //         // // todo aantal etappes meegeven ?
    //         // // todo opslaan in Firebase??
    //         // return Math.round(((totalTeampoints - riderPoints) / team.tourRiders.length ) -
    //         //     riderPoints -
    //         //     (3 * prediction.rider.waarde / 29 ));
    //
    //         return null;
    //     }
    // }


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
