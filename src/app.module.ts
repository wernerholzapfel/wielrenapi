import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Connection} from 'typeorm';
import 'dotenv/config';
import * as admin from 'firebase-admin';
import {Logger} from '@nestjs/common';
import {ormconfig} from './ormconfig';
import {TeamModule} from './teams/team.module';
import {RiderModule} from './rider/rider.module';
import {TourModule} from './tour/tour.module';
import {TourridersModule} from './tourriders/tourriders.module';

@Module({
    imports: [TypeOrmModule.forRoot(
        ormconfig),
        RiderModule, TeamModule, TourModule, TourridersModule],
    controllers: [AppController],
    components: [],
})
export class AppModule {
    private readonly logger = new Logger('App Module', true);

    constructor(private readonly connection: Connection) {

    // admin.auth().setCustomUserClaims(uid, {admin: false}).then(() => {
    //    this.logger.log('customerset');
    //     });
    }
}
