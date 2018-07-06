import {HttpStatus, Logger, Middleware} from '@nestjs/common';
import {ExpressMiddleware, NestMiddleware} from '@nestjs/common/interfaces/middlewares';
import {HttpException} from '@nestjs/common';
import {getRepository} from 'typeorm';
import {Tour} from './tour/tour.entity';

@Middleware()
export class PredictionMiddleware implements NestMiddleware {
    private readonly logger = new Logger('PredictionMiddleware', true);

    resolve(): ExpressMiddleware {
        return (req, res, next) => {
            this.logger.log(req.body.tour.id);

            return getRepository(Tour).findOne({id: req.body.tour.id})
                .then(tour => {
                    this.logger.log(tour.deadline.toString());
                    if (tour && Date.parse(tour.deadline.toString()) < Date.now()) {
                        throw new HttpException({
                            message: 'Je kan geen voorspellingen meer opslaan. De deadline is geweest.',
                            statusCode: HttpStatus.FORBIDDEN,
                        }, HttpStatus.FORBIDDEN);
                    }
                    else next();
                }, err => {
                    throw new HttpException({
                        message: err,
                        statusCode: HttpStatus.BAD_REQUEST,
                    }, HttpStatus.BAD_REQUEST);
                });
        };
    }
}