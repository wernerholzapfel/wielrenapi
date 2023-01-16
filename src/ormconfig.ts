import 'dotenv/config';
import {Team} from './teams/team.entity';
import {Rider} from './rider/rider.entity';
import {Tour} from './tour/tour.entity';
import {Tourriders} from './tourriders/tourriders.entity';
import {Prediction} from './prediction/prediction.entity';
import {Participant} from './participant/participant.entity';
import {Etappe} from './etappe/etappe.entity';
import {Stageclassification} from './stageclassification/stageclassification.entity';
import {Tourclassification} from './tourclassification/tourclassification.entity';
import {Youthclassification} from './youthclassification/youthclassification.entity';
import {Mountainclassification} from './mountainclassification/mountainclassification.entity';
import {Pointsclassification} from './pointsclassification/pointsclassification.entity';
import {TypeOrmModuleOptions} from '@nestjs/typeorm';
import {Headline} from './headlines/headline.entity';
import {PredictionScore} from './prediction-score/prediction-score.entity';

// @ts-ignore
export const ormconfig: TypeOrmModuleOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    // @ts-ignore
    ssl:  {rejectUnauthorized: false},
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
        PredictionScore,
        Headline],
    logging: false,
    synchronize: false, // DEV only, do not use on PROD!
};
