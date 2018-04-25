import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Connection} from 'typeorm';
import {CyclistModule} from './cyclist/cyclist.module';
import {Cyclist} from './cyclist/cyclist.entity';
import 'dotenv/config';
import * as admin from 'firebase-admin';
import {Logger} from '@nestjs/common';

@Module({
    imports: [TypeOrmModule.forRoot(
        {
            type: 'postgres',
            url: process.env.DATABASE_URL,
            ssl: process.env.DB_SSL,
            entities: [Cyclist],
            logging: false,
            synchronize: true, // DEV only, do not use on PROD!
        }),
        CyclistModule],
    controllers: [AppController],
    components: [],
})
export class AppModule {
    private readonly logger = new Logger('CyclistController', true);

    constructor(private readonly connection: Connection) {

    // admin.auth().setCustomUserClaims(uid, {admin: false}).then(() => {
    //    this.logger.log('customerset');
    //     });
    }
}
