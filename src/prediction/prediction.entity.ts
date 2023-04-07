import {Column, CreateDateColumn, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';
import {Tourriders, TourridersRead} from '../tourriders/tourriders.entity';
import {Tour} from '../tour/tour.entity';
import {Participant} from '../participant/participant.entity';
import {Stageclassification} from '../stageclassification/stageclassification.entity';
import {PredictionScore} from '../prediction-score/prediction-score.entity';

@Entity()
@Index(['participant', 'tour', 'rider' ], {unique: true})
export class Prediction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({default: false})
    isRider: boolean;

    @Column({default: false})
    isWaterdrager: boolean;

    @Column({default: false})
    isMeesterknecht: boolean;

    @Column({default: false})
    isLinkebal: boolean;

    @Column({default: false})
    isBeschermdeRenner: boolean;

    @Column({default: false})
    isComplete: boolean;

    @ManyToOne(type => Tourriders, rider => rider.predictions, { onDelete: 'CASCADE' })
    rider: Tourriders;

    @ManyToOne(type => Tour, tour => tour.predictions)
    tour: Tour;

    @ManyToOne(type => Participant, participant => participant.predictions)
    participant: Participant;

    @OneToMany(type => PredictionScore, predictionScore  => predictionScore.prediction)
    predictionScore: PredictionScore[];

    @UpdateDateColumn()
    updatedDate: Date;

    @CreateDateColumn()
    createdDate: Date;

}

export class PredictionRead extends Prediction {
    rider: TourridersRead;
    totalStagePoints?: number;
    youthPoints?: number;
    mountainPoints?: number;
    tourPoints?: number;
    pointsPoints?: number;
    deltaStagePoints?: number;
}
