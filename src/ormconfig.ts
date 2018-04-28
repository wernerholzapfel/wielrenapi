import 'dotenv/config';
import {Team} from './teams/team.entity';
import {Rider} from './rider/rider.entity';
import {Tour} from './tour/tour.entity';
import {Tourriders} from './tourriders/tourriders.entity';

export const ormconfig = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL,
    entities: [Rider, Team, Tour, Tourriders],
    logging: true,
    synchronize: true, // DEV only, do not use on PROD!
};
