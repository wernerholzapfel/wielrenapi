import { HttpStatus, Injectable, Logger, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tourriders, TourridersRead } from './tourriders.entity';
import { Connection, DeleteResult, Repository } from 'typeorm';
import { Tour, TourRead } from '../tour/tour.entity';
import { Team } from '../teams/team.entity';
import { Etappe } from '../etappe/etappe.entity';
import { Stageclassification } from '../stageclassification/stageclassification.entity';
import { Prediction } from '../prediction/prediction.entity';
import { Tourclassification } from '../tourclassification/tourclassification.entity';
import { CreateTourridersDto } from './create-tourriders.dto';
import * as admin from 'firebase-admin';

@Injectable()
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

    async tourridersForTour(tourId): Promise<Tourriders[]> {
        return await this.connection
            .getRepository(Tourriders)
            .createQueryBuilder('tourriders')
            .leftJoinAndSelect('tourriders.rider', 'rider')
            .leftJoin('tourriders.tour', 'tour')
            .where('tour.id = :tourId', { tourId })
            .getMany();
    }

    async tourridersForTeam(tourId, teamId): Promise<Tourriders[]> {
        return await this.connection
            .getRepository(Tourriders)
            .createQueryBuilder('tourriders')
            .leftJoinAndSelect('tourriders.rider', 'rider')
            .leftJoin('tourriders.tour', 'tour')
            .leftJoin('tourriders.team', 'team')
            .where('tour.id = :tourId', { tourId })
            .andWhere('team.id = :teamId', { teamId })
            .orderBy('rider.surName')
            .getMany();
    }


    async getDetails(tourId: string): Promise<TourridersRead[]> {
        const tourriders: TourridersRead[] = await this.connection
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
            .leftJoinAndSelect('tourrider.predictions', 'tourriderpredictions')
            .leftJoinAndSelect('tourriderpredictions.participant', 'tourriderpredictionsparticipant')
            .leftJoinAndSelect('stageclassifications.etappe', 'etappe')
            .where('tour.id = :id', { id: tourId })
            .getMany();

        const teams: Team[] = await this.getTeamClassifications(tourId);
        const etappes: Etappe[] = await this.getDrivenEtappes(tourId);


        tourriders.map(rider => {
            rider.stageclassifications =
                [...rider.stageclassifications]
                    .map(sc =>
                        Object.assign(sc, { stagePoints: this.calculatePoints(sc, etappeFactor) })
                    );
            if (rider.isOut) {
                rider.stageclassifications.push({
                    stagePoints: rider.isOut ? didNotFinishPoints : 0,
                    etappe: rider.latestEtappe,
                });
            }
            [...rider.tourclassifications]
                .map(tc =>
                    Object.assign(rider, { tourPoints: this.calculatePoints(tc, tourFactor) })
                );
            [...rider.youthclassifications]
                .map(yc =>
                    Object.assign(rider, { youthPoints: this.calculatePoints(yc, youthFactor) })
                );
            [...rider.mountainclassifications]
                .map(mc =>
                    Object.assign(rider, { mountainPoints: this.calculatePoints(mc, mountainFactor) })
                );
            [...rider.pointsclassifications]
                .map(pc =>
                    Object.assign(rider, { pointsPoints: this.calculatePoints(pc, pointsFactor) })
                );
            Object.assign(rider, { waterdragerTruienPoints: this.determineWDTruienPunten(rider, teams) });
            Object.assign(rider, { waterdragerEtappePoints: this.determineWDEtappepunten(rider, teams, etappes) });
            Object.assign(rider, { waterdragerTotalPoints: rider.waterdragerTruienPoints + rider.waterdragerEtappePoints });
            Object.assign(rider, { totalStagePoints: this.determineSCTotaalpunten(rider, teams, etappes.length) });
        });
        return tourriders;

    }
    async getNewDetails(tourId: string): Promise<TourridersRead[]> {
        const tourriders: TourridersRead[] = await this.connection
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
            .leftJoinAndSelect('tourrider.predictions', 'tourriderpredictions')
            .leftJoinAndSelect('tourriderpredictions.participant', 'tourriderpredictionsparticipant')
            .leftJoinAndSelect('stageclassifications.etappe', 'etappe')
            .where('tour.id = :id', { id: tourId })
            .getMany();

        const teams: Team[] = await this.getTeamClassifications(tourId);
        const etappes: Etappe[] = await this.getDrivenEtappes(tourId);


        tourriders.map(rider => {
            rider.stageclassifications =
                [...rider.stageclassifications]
                    .map(sc =>
                        Object.assign(sc, { stagePoints: this.calculatePoints(sc, etappeFactor) })
                    );
            if (rider.isOut) {
                rider.stageclassifications.push({
                    stagePoints: rider.isOut ? didNotFinishPoints : 0,
                    etappe: rider.latestEtappe,
                });
            }
            [...rider.tourclassifications]
                .map(tc =>
                    Object.assign(rider, { tourPoints: this.calculatePoints(tc, tourFactor) })
                );
            [...rider.youthclassifications]
                .map(yc =>
                    Object.assign(rider, { youthPoints: this.calculatePoints(yc, youthFactor) })
                );
            [...rider.mountainclassifications]
                .map(mc =>
                    Object.assign(rider, { mountainPoints: this.calculatePoints(mc, mountainFactor) })
                );
            [...rider.pointsclassifications]
                .map(pc =>
                    Object.assign(rider, { pointsPoints: this.calculatePoints(pc, pointsFactor) })
                );
            Object.assign(rider, { waterdragerTruienPoints: this.determineWDTruienPunten(rider, teams) });
            Object.assign(rider, { waterdragerEtappePoints: this.determineWDEtappepunten(rider, teams, etappes) });
            Object.assign(rider, { waterdragerTotalPoints: rider.waterdragerTruienPoints + rider.waterdragerEtappePoints });
            Object.assign(rider, { totalStagePoints: this.determineSCTotaalpunten(rider, teams, etappes.length) });
        });
        return tourriders;

    }


    async updateTourridersFirebase(tourId: string) {
        const tourriders = await this.getDetails(tourId);
        const db = admin.database();
        const ref = db.ref(tourId);

        const rennersRef = ref.child('renners');
        rennersRef.set(tourriders);
        return tourriders;
    }

    async create(tourriders: CreateTourridersDto): Promise<Tourriders> {
        return await this.tourridersRepository.save(tourriders)
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }
    
    async update(tourriders: any): Promise<any> {
        return await this.tourridersRepository
        .createQueryBuilder()
        .update(Tourriders)
        .set(tourriders)
        .where("id = :id", { id: tourriders.id })
        .execute()
    }

    async delete(tourriderId): Promise<DeleteResult> {
        return await this.connection
            .getRepository(Tourriders)
            .createQueryBuilder()
            .delete()
            .where("id = :id", { id: tourriderId })
            .execute();
    }

    async getTeamClassifications(id: string): Promise<Team[]> {
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
            .where('tour.id = :id', { id })
            .andWhere('tourRidersTour.id = :id', { id })
            .getMany();
    }

    async getDrivenEtappes(id: string): Promise<Etappe[]> {
        return await this.connection
            .getRepository(Etappe)
            .createQueryBuilder('etappe')
            .leftJoinAndSelect('etappe.tour', 'tour')
            .where('tour.id = :id', { id })
            .andWhere('etappe.isDriven')
            .getMany();

    }

    determineWDTruienPunten(rider: Tourriders, teams: Team[]) {
        return this.determineWDTourPunten(rider, teams, tourFactor) +
            this.determineWDMountainPunten(rider, teams, mountainFactor) +
            this.determineWDYouthPunten(rider, teams, youthFactor) +
            this.determineWDPointsPunten(rider, teams, pointsFactor);

    }

    determineWDTourPunten(rider: Tourriders, teams: Team[], factor: number) {
        if (rider.isOut) {
            return -1 * rider.waarde;
        }
        const team = teams.find(team => team.id === rider.team.id);

        const totalTeampoints = team.tourRiders
            .map(teamRider => teamRider.tourclassifications
                .reduce((totalPoints, tc) => {
                    return totalPoints + this.calculatePoints(tc, factor);
                }, 0))
            .reduce((acc, value) => {
                return acc + value;
            });

        const classification: Tourclassification = team.tourRiders
            .find(tourrider => tourrider.id === rider.id).tourclassifications[0];

        const riderPoints = classification ? this.calculatePoints(classification, factor) : 0;

        const classificationsPoints = Math.round(((totalTeampoints - riderPoints) / (team.tourRiders.length - 1)) -
            riderPoints - rider.waarde);

        return classificationsPoints;
    }

    determineWDMountainPunten(rider: Tourriders, teams: Team[], factor: number) {
        if (rider.isOut) {
            return -1 * rider.waarde;
        }
        const team = teams.find(team => team.id === rider.team.id);

        const totalTeampoints = team.tourRiders
            .map(teamRider => teamRider.mountainclassifications
                .reduce((totalPoints, tc) => {
                    return totalPoints + this.calculatePoints(tc, factor);
                }, 0))
            .reduce((acc, value) => {
                return acc + value;
            });

        const classification: any = team.tourRiders.find(tourrider => tourrider.id === rider.id).mountainclassifications[0];

        const riderPoints = classification ? this.calculatePoints(classification, factor) : 0;

        const classificationsPoints = Math.round(((totalTeampoints - riderPoints) / (team.tourRiders.length - 1)) -
            riderPoints - rider.waarde);

        return classificationsPoints;
    }

    determineWDYouthPunten(rider: Tourriders, teams: Team[], factor: number) {
        if (rider.isOut) {
            return -1 * rider.waarde;
        }
        const team = teams.find(team => team.id === rider.team.id);

        const totalTeampoints = team.tourRiders
            .map(teamRider => teamRider.youthclassifications
                .reduce((totalPoints, tc) => {
                    return totalPoints + this.calculatePoints(tc, factor);
                }, 0))
            .reduce((acc, value) => {
                return acc + value;
            });

        const classification: any = team.tourRiders.find(tourrider => tourrider.id === rider.id).youthclassifications[0];

        const riderPoints = classification ? this.calculatePoints(classification, factor) : 0;

        const classificationsPoints = Math.round(((totalTeampoints - riderPoints) / (team.tourRiders.length - 1)) -
            riderPoints - rider.waarde);

        return classificationsPoints;
    }

    determineWDPointsPunten(rider: Tourriders, teams: Team[], factor: number) {
        if (rider.isOut) {
            return -1 * rider.waarde;
        }
        const team = teams.find(team => team.id === rider.team.id);

        const totalTeampoints = team.tourRiders
            .map(teamRider => teamRider.pointsclassifications
                .reduce((totalPoints, tc) => {
                    return totalPoints + this.calculatePoints(tc, factor);
                }, 0))
            .reduce((acc, value) => {
                return acc + value;
            });

        const classification: any = team.tourRiders.find(tourrider => tourrider.id === rider.id).pointsclassifications[0];

        const riderPoints = classification ? this.calculatePoints(classification, factor) : 0;

        const classificationsPoints = Math.round(((totalTeampoints - riderPoints) / (team.tourRiders.length - 1)) -
            riderPoints - rider.waarde);

        return classificationsPoints;
    }

    determineWDEtappepunten(rider: Tourriders, teams: Team[], drivenEttapes: Etappe[]): any[] {
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
        const newStage = { id: null, position: etappePosition, etappe: etappe, stagePoints: null };

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

        // this.logger.log('totalteampoints wd: ' + rider.rider.surName + ' ' + totalTeampoints);
        const riderPoints = newStage.position ? this.calculatePoints(newStage, etappeFactor) : 0;
        // this.logger.log('riderPoints wd: ' + rider.rider.surName + ' ' + riderPoints);

        const calculation = '((' + totalTeampoints + '-' + riderPoints + ') / (' + team.tourRiders.length + '-' + 1 + ')) - ' + riderPoints;
        const stagePointsWD = Math.round(((totalTeampoints - riderPoints) / (team.tourRiders.length - 1)) -
            riderPoints);

        // this.logger.log('stagePointsWd: ' + newStage.etappe.etappeNumber + ' - ' + rider.rider.surName + ' ' + stagePointsWD);
        Object.assign(newStage, { stagePoints: stagePointsWD, calculation: calculation });
        return newStage;
    }


    determineSCTotaalpunten(rider: TourridersRead, teams: Team[], NumberOfDrivenEttapes: number) {
        return rider.stageclassifications.reduce((totalPoints, sc) => {
            return totalPoints + sc.stagePoints;
        }, 0);
    }

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
