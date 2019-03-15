import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Rider} from './rider.entity';
import {Repository} from 'typeorm';
import {CreateRiderDto} from './create-rider.dto';

@Injectable()
export class RiderService {
    constructor(
        @InjectRepository(Rider)
        private readonly riderRepository: Repository<Rider>,
    ) {
    }

    async findAll(): Promise<Rider[]> {
        return await this.riderRepository.find();
    }

    async create(rider: CreateRiderDto): Promise<Rider> {
        return await this.riderRepository.save(rider)
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }
}