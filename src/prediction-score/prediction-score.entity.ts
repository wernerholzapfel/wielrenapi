import {Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Prediction} from '../prediction/prediction.entity';
import {Tour} from '../tour/tour.entity';
import {Tourriders} from '../tourriders/tourriders.entity';
import {Etappe} from '../etappe/etappe.entity';
import {Participant} from '../participant/participant.entity';
import {Stageclassification, StageClassificationRead} from '../stageclassification/stageclassification.entity';
export enum PredictionEnum {
    ETAPPE = 'etappe',
    BERG = 'berg',
    ALGEMEEN = 'algemeen',
    JONGEREN = 'jongeren',
    PUNTEN = 'punten'
}

@Entity()
export class PredictionScore {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column({type: 'int'})
    punten: number;

    @Index()
    @ManyToOne(type => Participant, participant => participant.predictionScore)
    participant: Participant;

    @Index()
    @ManyToOne(type => Tour, tour => tour.predictionScore)
    tour?: Tour;

    @Index()
    @ManyToOne(type => Prediction, prediction => prediction.predictionScore)
    prediction: Prediction;

    @Column({
        type: 'enum',
        enum: PredictionEnum,
        default: PredictionEnum.ETAPPE
    })
    predictionType: PredictionEnum

    @Index()
    @ManyToOne(type => Etappe, etappe => etappe.predictionScore)
    etappe?: Etappe;

    @Index()
    @ManyToOne(type => Stageclassification, stageClassification => stageClassification.predictionScore)
    stageClassification?: Stageclassification;

}
