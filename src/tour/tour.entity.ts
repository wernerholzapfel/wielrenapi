import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Team} from '../teams/team.entity';
import {Tourriders} from '../tourriders/tourriders.entity';
import {Prediction} from '../prediction/prediction.entity';
import {Etappe} from '../etappe/etappe.entity';
import {Stageclassification, StageClassificationRead} from '../stageclassification/stageclassification.entity';
import {Tourclassification} from '../tourclassification/tourclassification.entity';
import {Youthclassification} from '../youthclassification/youthclassification.entity';
import {Mountainclassification} from '../mountainclassification/mountainclassification.entity';
import {Pointsclassification} from '../pointsclassification/pointsclassification.entity';
import {Headline} from '../headlines/headline.entity';
import {PredictionScore} from '../prediction-score/prediction-score.entity';

@Entity()
export class Tour {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    tourName: string;

    @Column({type: 'date'})
    startDate: Date;

    @Column({type: 'date'})
    endDate: Date;

    @Column({type: 'timestamp', nullable: true})
    deadline: Date;

    @Column({default: false})
    isActive: boolean;

    @Column({default: false})
    hasEnded: boolean;

    @Column({default: 1})
    scoreTable: number;

    @OneToMany(type => Tourriders, tourriders => tourriders.tour)
    tourRiders: Tourriders[];

    @OneToMany(type => Prediction, prediction => prediction.rider)
    predictions: Prediction[];

    @OneToMany(type => Etappe, etappe => etappe.tour)
    etappes: Etappe[];

    @OneToMany(type => Stageclassification, stagecf => stagecf.tour)
    stageclassifications: Stageclassification[];

    @OneToMany(type => Tourclassification, tourcf => tourcf.tour)
    tourclassifications: Tourclassification[];

    @OneToMany(type => Youthclassification, youthcf => youthcf.tour)
    youthclassifications: Youthclassification[];

    @OneToMany(type => Mountainclassification, mountaincf => mountaincf.tour)
    mountainclassifications: Mountainclassification[];

    @OneToMany(type => Pointsclassification, pointscf => pointscf.tour)
    pointsclassifications: Pointsclassification[];

    @OneToMany(type => PredictionScore, predictionScore  => predictionScore.prediction)
    predictionScore: PredictionScore[];

    @OneToMany(type => Headline, headline => headline.tour)
    headlines: Headline[];

    @ManyToMany(type => Team, team => team.tour)
    @JoinTable()
    teams: Team[];

}

export class TourRead extends Tour {
    stageclassifications: StageClassificationRead[]
}


