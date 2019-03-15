import 'dotenv/config';
import {Team} from './app/teams/team.entity';
import {Rider} from './app/rider/rider.entity';
import {Tour} from './app/tour/tour.entity';
import {Tourriders} from './app/tourriders/tourriders.entity';
import {Prediction} from './app/prediction/prediction.entity';
import {Participant} from './app/participant/participant.entity';
import {Etappe} from './app/etappe/etappe.entity';
import {Stageclassification} from './app/stageclassification/stageclassification.entity';
import {Tourclassification} from './app/tourclassification/tourclassification.entity';
import {Youthclassification} from './app/youthclassification/youthclassification.entity';
import {Mountainclassification} from './app/mountainclassification/mountainclassification.entity';
import {Pointsclassification} from './app/pointsclassification/pointsclassification.entity';
import {TypeOrmModuleOptions} from '@nestjs/typeorm';
import {Headline} from './app/headlines/headline.entity';

// @ts-ignore
export const ormconfig: TypeOrmModuleOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL,
    entities: [
        Rider,
        Team,
        Tour,
        Tourriders,
        Prediction,
        Participant,
        Etappe,
        Stageclassification,
        Tourclassification,
        Youthclassification,
        Mountainclassification,
        Pointsclassification,
        Headline],
    logging: false,
    synchronize: true, // DEV only, do not use on PROD!
};
