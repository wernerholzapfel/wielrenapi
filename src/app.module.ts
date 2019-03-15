import {Logger, MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common';
import {AppController} from './app.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import 'dotenv/config';
import {ormconfig} from './ormconfig';
import {TeamModule} from './app/teams/team.module';
import {RiderModule} from './app/rider/rider.module';
import {TourModule} from './app/tour/tour.module';
import {TourridersModule} from './app/tourriders/tourriders.module';
import {PredictionModule} from './app/prediction/prediction.module';
import {ParticipantModule} from './app/participant/participant.module';
import {AddFireBaseUserToRequest} from './authentication.middleware';
import {EtappeModule} from './app/etappe/etappe.module';
import {StageclassificationModule} from './app/stageclassification/stageclassification.module';
import {TourclassificationModule} from './app/tourclassification/tourclassification.module';
import {YouthclassificationModule} from './app/youthclassification/youthclassification.module';
import {MountainclassificationModule} from './app/mountainclassification/mountainclassification.module';
import {PointsclassificationModule} from './app/pointsclassification/pointsclassification.module';
import {PredictionMiddleware} from './prediction.middleware';
import {HeadlineModule} from './app/headlines/headline.module';

@Module({
    imports: [TypeOrmModule.forRoot(
        ormconfig),
        RiderModule,
        TeamModule,
        TourModule,
        TourridersModule,
        PredictionModule,
        ParticipantModule,
        EtappeModule,
        StageclassificationModule,
        TourclassificationModule,
        YouthclassificationModule,
        MountainclassificationModule,
        PointsclassificationModule,
        HeadlineModule],
    controllers: [AppController],
    providers: [],
})
export class AppModule implements NestModule {
    private readonly logger = new Logger('AppModule', true);

    configure(consumer: MiddlewareConsumer): void {

        consumer.apply(AddFireBaseUserToRequest).forRoutes(
            {path: '/**', method: RequestMethod.POST},
            {path: '/predictions/user/**', method: RequestMethod.GET},
            {path: '/participants/loggedIn', method: RequestMethod.GET});
        consumer.apply(PredictionMiddleware).forRoutes(
            {path: '/predictions', method: RequestMethod.POST},
        );

        // admin.auth().setCustomUserClaims('ENPg7LZlewdswg6vqVd65K4QjQy1', {admin: true}).then(() => {
        //     this.logger.log('customerset');
        // });
    }
}