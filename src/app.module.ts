import {Logger, MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common';
import {AppController} from './app.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import 'dotenv/config';
import {ormconfig} from './ormconfig';
import {TeamModule} from './teams/team.module';
import {RiderModule} from './rider/rider.module';
import {TourModule} from './tour/tour.module';
import {TourridersModule} from './tourriders/tourriders.module';
import {PredictionModule} from './prediction/prediction.module';
import {ParticipantModule} from './participant/participant.module';
import {AddFireBaseUserToRequest} from './authentication.middleware';
import {EtappeModule} from './etappe/etappe.module';
import {StageclassificationModule} from './stageclassification/stageclassification.module';
import {TourclassificationModule} from './tourclassification/tourclassification.module';
import {YouthclassificationModule} from './youthclassification/youthclassification.module';
import {MountainclassificationModule} from './mountainclassification/mountainclassification.module';
import {PointsclassificationModule} from './pointsclassification/pointsclassification.module';
import {PredictionMiddleware} from './prediction.middleware';
import {HeadlineModule} from './headlines/headline.module';

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