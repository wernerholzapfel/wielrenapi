import {Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Prediction} from '../prediction/prediction.entity';
import {Tour} from '../tour/tour.entity';
import {Tourriders} from '../tourriders/tourriders.entity';
import {Etappe} from '../etappe/etappe.entity';

@Entity()
@Index(['tour', 'tourrider'], {unique: true})

export class Youthclassification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    position: number;

    @ManyToOne(type => Tour, tour => tour.youthclassifications)
    tour: Tour;

    @ManyToOne(type => Tourriders, tourriders => tourriders.youthclassifications)
    tourrider   : Tourriders;

}
