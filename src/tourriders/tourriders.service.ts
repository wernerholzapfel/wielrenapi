import {Component, HttpStatus, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Tourriders} from './tourriders.entity';
import {Connection, Repository} from 'typeorm';
import {HttpException} from '@nestjs/core';
import {Tour} from '../tour/tour.entity';
import {Team} from '../teams/team.entity';
import {Etappe} from '../etappe/etappe.entity';
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
            Object.assign(rider, {waterdragerPoints: this.determineWDTotaalpunten(rider, teams, etappes, tourId)});
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
            .leftJoin('tourRiders.tour', 'tourRidersTour')
            .leftJoinAndSelect('tourRiders.stageclassifications', 'sc')
            .leftJoinAndSelect('sc.etappe', 'etappe')
            .where('tour.id = :id', {id})
            .andWhere('tourRidersTour.id = :id', {id})
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

    determineWDTotaalpunten(rider: Tourriders, teams: Team[], drivenEttapes: Etappe[], tourId: string): any[] {
        return drivenEttapes.map(etappe => {
            return this.determineWDPunten(rider, etappe, teams, etappeFactor);
        })
            .reduce((acc, value) => {
                return acc + value.stagePoints;
            }, 0)
    }

    determinePositionInEtappe(etappe: Etappe, stageclassifications: Stageclassification[]) {
        return (stageclassifications.find(sc => sc.etappe.id === etappe.id)) ?
            stageclassifications.find(sc => sc.etappe.id === etappe.id).position : null;
    }

    determineWDPunten(rider: Tourriders, etappe: Etappe, teams: Team[], etappeFactor: number) {
        const etappePosition = this.determinePositionInEtappe(etappe, rider.stageclassifications);
        const newStage = {id: null, position: etappePosition, etappe: etappe};

        const team = teams.find(team => team.id === rider.team.id);

        const totalTeampoints = team.tourRiders
            .map(teamRider => teamRider.stageclassifications
                .reduce((totalPoints, sc) => {
                    if (sc.etappe && sc.etappe.id === newStage.etappe.id && (!rider.latestEtappe ||
                        (rider.latestEtappe && sc.etappe.etappeNumber < rider.latestEtappe.etappeNumber))) {
                        return totalPoints + this.calculatePoints(sc, etappeFactor);
                    } else {
                        return totalPoints;
                    }
                }, 0))
            .reduce((acc, value) => {
                return acc + value;
            });

        this.logger.log('totalteampoints wd: ' + rider.rider.surName + ' ' + totalTeampoints);
        const riderPoints = newStage.position ? this.calculatePoints(newStage, etappeFactor) : 0;
        this.logger.log('riderPoints wd: ' + rider.rider.surName + ' ' + riderPoints);

        const calculation = '((' + totalTeampoints + '-' + riderPoints + ') / (' + team.tourRiders.length + '-' + 1 + ')) - ' + riderPoints;
        const stagePointsWD = Math.round(((totalTeampoints - riderPoints) / (team.tourRiders.length - 1)) -
            riderPoints);

        this.logger.log('stagePointsWd: ' + newStage.etappe.etappeNumber + ' - ' + rider.rider.surName + ' ' + stagePointsWD);
        Object.assign(newStage, {stagePoints: stagePointsWD, calculation: calculation});
        return newStage;
    }


    determineSCTotaalpunten(rider: Tourriders, teams: Team[], NumberOfDrivenEttapes: number) {
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


    calculatePoints(sc: any, factor: number) {
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
const didNotFinishPoints = -20;

const etappeFactor = 1;
const tourFactor = 2.5;
const mountainFactor = 2;
const youthFactor = 1.5;
const pointsFactor = 2;
