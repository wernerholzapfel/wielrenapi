import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Rider} from '../rider/rider.entity';
import {Team} from '../teams/team.entity';
import {Tourriders} from '../tourriders/tourriders.entity';
import {Prediction} from '../prediction/prediction.entity';
import {Etappe} from '../etappe/etappe.entity';
import {Stageclassification} from '../stageclassification/stageclassification.entity';

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

    @Column({default: true})
    isActive: boolean;

    @OneToMany(type => Tourriders, tourriders => tourriders.tour)
    tourRiders: Tourriders[];

    @OneToMany(type => Prediction, prediction  => prediction.rider)
    predictions: Prediction[];

    @OneToMany(type => Etappe, etappe  => etappe.tour)
    etappes: Etappe[];

    @OneToMany(type => Stageclassification, stagecf  => stagecf.tour)
    stageclassifications: Stageclassification[];

    @ManyToMany(type => Team, team => team.tour)
    @JoinTable()
    teams: Team[];

}



