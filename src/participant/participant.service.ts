import {Component, HttpStatus, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Participant} from './participant.entity';
import {Connection, Repository} from 'typeorm';
import {HttpException} from '@nestjs/core';
import {Stageclassification} from '../stageclassification/stageclassification.entity';
import {Prediction} from '../prediction/prediction.entity';
import {Team} from '../teams/team.entity';

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
            .where('tour.isActive')
            .getMany();

    }

    async getStand(): Promise<Participant[]> {

        const participants = await this.connection
            .getRepository(Participant)
            .createQueryBuilder('participant')
            .leftJoinAndSelect('participant.predictions', 'predictions')
            .leftJoinAndSelect('predictions.rider', 'tourrider')
            .leftJoinAndSelect('tourrider.rider', 'rider')
            .leftJoinAndSelect('tourrider.team', 'team')
            .leftJoinAndSelect('tourrider.stageclassifications', 'stageclassifications')
            .leftJoinAndSelect('stageclassifications.etappe', 'etappe')
            .leftJoin('predictions.tour', 'tour')
            .where('tour.isActive')
            .getMany();

        const teams: Team[] = await this.getTeamClassifications();

        participants.map(participant => {
            [...participant.predictions]
                .map(prediction => {
                    return prediction.rider.stageclassifications =
                        [...prediction.rider.stageclassifications]
                            .map(sc =>
                                Object.assign(sc, {punten: this.determinePunten(sc, prediction, teams)})
                            );
                });
        });
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

    determinePunten(sc: Stageclassification, prediction: Prediction, teams: Team[]) {

        this.logger.log('daar ga ik: ' + sc.position);
        if (prediction.isRider) {
            return this.calculatePoints(sc)
        }
        if (prediction.isBeschermdeRenner) {
            return this.calculatePoints(sc)
        }
        if (prediction.isMeesterknecht) {
            return -1 * this.calculatePoints(sc)
        }
        if (prediction.isLinkebal) {
            return 2 * this.calculatePoints(sc)
        }
        if (prediction.isWaterdrager) {
            const team = teams.find(team => team.id === prediction.rider.team.id);

            const totalTeampoints = team.tourRiders
                .map(rider => rider.stageclassifications
                    .reduce((totalPoints, sc) => {
                        return totalPoints + this.calculatePoints(sc);
                    }, 0))
                .reduce((acc, value) => {
                    return acc + value;
                });

            const riderPoints = this.calculatePoints(sc);
            // todo aantal etappes meegeven ?
            // todo opslaan in Firebase??
            return Math.round(((totalTeampoints - riderPoints) / team.tourRiders.length ) -
                riderPoints -
                (3 * prediction.rider.waarde / 29 ));
        }
    }


    calculatePoints(sc: Stageclassification) {
        switch (sc.position) {
            case 1:
                return etappe1;
            case 2:
                return etappe2;
            case 3:
                return etappe3;
            case 4:
                return etappe4;
            case 5:
                return etappe5;
            case 6:
                return etappe6;
            case 7:
                return etappe7;
            case 8:
                return etappe8;
            case 9:
                return etappe9;
            case 10:
                return etappe10;
            case 11:
                return etappe11;
            case 12:
                return etappe12;
            case 13:
                return etappe13;
            case 14:
                return etappe14;
            case 15:
                return etappe15;
            case 16:
                return etappe16;
            case 17:
                return etappe17;
            case 18:
                return etappe18;
            case 19:
                return etappe19;
            case 20:
                return etappe20;
            default:
                return 0;
        }
    }
}


const
    etappe1 = 60;
const
    etappe2 = 52;
const
    etappe3 = 44;
const
    etappe4 = 38;
const
    etappe5 = 34;
const
    etappe6 = 30;
const
    etappe7 = 28;
const
    etappe8 = 26;
const
    etappe9 = 24;
const
    etappe10 = 22;
const
    etappe11 = 20;
const
    etappe12 = 18;
const
    etappe13 = 16;
const
    etappe14 = 14;
const
    etappe15 = 12;
const
    etappe16 = 10;
const
    etappe17 = 8;
const
    etappe18 = 6;
const
    etappe19 = 4;
const
    etappe20 = 2;


// participants.map(participant => {
//         [...participant.predictions]
//             .map(prediction => {
//                 // const punten = 5;
//                 return prediction.rider.stageclassifications =
//                     [...prediction.rider.stageclassifications]
//                         .map(sc =>
//                             Object.assign(sc, {punten: this.determinePunten(sc)})
//                         );
//             });
// });
// return participants;