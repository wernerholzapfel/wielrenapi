import {HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Tour} from './tour.entity';
import {Connection, getConnection, getRepository, Repository} from 'typeorm';
import {Team} from '../teams/team.entity';
import {AddTeamsRequestDto, CreateTourDto} from './create-tour.dto';

// export interface AddTeamsRequest {
    // tour: Tour;
    // teams: Team[];
// }

@Injectable()
export class TourService {
    private readonly logger = new Logger('TourService', true);

    constructor(private readonly connection: Connection,
                @InjectRepository(Tour)
                private readonly tourRepository: Repository<Tour>,) {
    }

    async findAll(): Promise<Tour[]> {
        return await this.connection
            .getRepository(Tour)
            .createQueryBuilder('tour')
            .getMany();
    }
    
    async getActiveTour(): Promise<Tour> {
        return await this.connection
            .getRepository(Tour)
            .createQueryBuilder('tour')
            .where('tour.isActive = true')
            .getOne();
    }

    async findTour(id: string): Promise<Tour> {
        return await this.connection
            .getRepository(Tour)
            .createQueryBuilder('tour')
            .leftJoinAndSelect('tour.teams', 'team')
            .leftJoinAndSelect('team.tourRiders', 'tourriders', '(tourriders.tour.id = :id OR tourriders.tour.id IS NULL)', {id})
            .leftJoinAndSelect('tourriders.rider', 'rider')
            .leftJoinAndSelect('tourriders.latestEtappe', 'latestEtappe')
            .where('tour.id = :id', {id})
            .andWhere('(tourriders.tour.id = :id OR tourriders.tour.id IS NULL)', {id})
            .getOne();
    }

    async create(tour: CreateTourDto): Promise<Tour> {
        return await this.tourRepository.save(tour)
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }

    async deleteTeamsFromTour(tour: Tour): Promise<any> {
        const storedTour = await getRepository(Tour).createQueryBuilder('tour')
            .leftJoinAndSelect('tour.teams', 'teams')
            .where('tour.id = :tourId', {tourId: tour.id})
            .getOne();

        return await storedTour.teams.forEach(async team => {
            this.logger.log('delete: ' + team.teamName);
            await
                getConnection()
                    .createQueryBuilder()
                    .relation(Tour, 'teams')
                    .of(tour)
                    .remove(team);
        });
    }

    async addTeamsToTour(bodyTour: AddTeamsRequestDto): Promise<any> {
        return await getConnection()
            .createQueryBuilder()
            .relation(Tour, 'teams')
            .of(bodyTour.tour)
            .add(bodyTour.teams);
    }
}
