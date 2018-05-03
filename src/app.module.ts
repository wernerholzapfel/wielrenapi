import {Module, NestModule, RequestMethod} from '@nestjs/common';
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
import {PredictionModule} from './prediction/prediction.module';
import {ParticipantModule} from './participant/participant.module';
import {MiddlewaresConsumer} from '@nestjs/common/interfaces/middlewares';
import {AddFireBaseUserToRequest} from './authentication.middleware';

@Module({
    imports: [TypeOrmModule.forRoot(
        ormconfig),
        RiderModule, TeamModule, TourModule, TourridersModule, PredictionModule, ParticipantModule],
    controllers: [AppController],
    components: [],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewaresConsumer): void {

        consumer.apply(AddFireBaseUserToRequest).forRoutes(
            {path: '/**', method: RequestMethod.POST});

    }


    // admin.auth().setCustomUserClaims(uid, {admin: false}).then(() => {
    //    this.logger.log('customerset');
    //     });
}
