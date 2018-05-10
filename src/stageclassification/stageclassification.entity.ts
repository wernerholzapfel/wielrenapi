import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Prediction} from '../prediction/prediction.entity';
import {Tour} from '../tour/tour.entity';
import {Tourriders} from '../tourriders/tourriders.entity';
import {Etappe} from '../etappe/etappe.entity';

@Entity()
export class Stageclassification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    position: number;

    @ManyToOne(type => Tour, tour => tour.stageclassifications)
    tour: Tour;

    @ManyToOne(type => Tourriders, tourriders => tourriders.stageclassifications)
    tourrider   : Tourriders;

    @ManyToOne(type => Etappe, etappe => etappe.stageclassifications)
    etappe: Etappe;
}
