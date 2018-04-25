import 'dotenv/config';

export const ormconfig = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    // ssl: process.env.DB_SSL,
    entities: [
    ],
    logging: false,
    synchronize: true, // DEV only, do not use on PROD!
};
