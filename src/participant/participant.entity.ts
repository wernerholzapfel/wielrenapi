import {Column, Entity, Index, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Prediction, PredictionRead} from '../prediction/prediction.entity';
import {PredictionScore} from '../prediction-score/prediction-score.entity';

@Entity()
export class Participant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({select: false, unique: true})
    email: string;

    @Column({ nullable: true })
    displayName: string;

    @Column({ nullable: true })
    teamName: string;

    @Column({select: false, nullable: true})
    firebaseIdentifier: string;

    @OneToMany(type => Prediction, prediction => prediction.participant)
    predictions: Prediction[];

    @OneToMany(type => PredictionScore, predictionScore  => predictionScore.prediction)
    predictionScore: PredictionScore[];

    // todo tours koppelen
}

export class ParticipantRead extends Participant {
    predictions: PredictionRead[];
    previousTotalPoints?: number;
    totalPoints?: number;
    deltaTotalStagePoints?: number;
    totalYouthPoints?: number;
    totalMountainPoints?: number;
    totalTourPoints?: number;
    totalPointsPoints?: number;
}
