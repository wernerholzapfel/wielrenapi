import {
    Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne,
    PrimaryGeneratedColumn
} from 'typeorm';
import {Rider} from '../rider/rider.entity';
import {Team} from '../teams/team.entity';
import {Tour} from '../tour/tour.entity';
import {Prediction} from '../prediction/prediction.entity';
import {Stageclassification} from '../stageclassification/stageclassification.entity';
import {Tourclassification} from '../tourclassification/tourclassification.entity';
import {Youthclassification} from '../youthclassification/youthclassification.entity';
import {Mountainclassification} from '../mountainclassification/mountainclassification.entity';
import {Pointsclassification} from '../pointsclassification/pointsclassification.entity';
import {Etappe} from '../etappe/etappe.entity';

@Entity()
@Index(['rider', 'tour', 'team' ], {unique: true})

export class Tourriders {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    waarde: number;

    @Column({default: false})
    isOut: boolean;

    @ManyToOne(type => Etappe, etappe => etappe.tourRiders)
    latestEtappe: Etappe;

    @ManyToOne(type => Rider, rider => rider.tourRiders)
    rider: Rider;

    @ManyToOne(type => Tour, tour => tour.tourRiders)
    tour: Tour;

    @ManyToOne(type => Team, team => team.tourRiders)
    team: Team;

    @OneToMany(type => Prediction, prediction  => prediction.rider)
    predictions: Prediction[];

    @OneToMany(type => Stageclassification, stagecf  => stagecf.tourrider)
    stageclassifications: Stageclassification[];

    @OneToMany(type => Tourclassification, tourcf  => tourcf.tourrider)
    tourclassifications: Tourclassification[];

    @OneToMany(type => Youthclassification, youthcf  => youthcf.tourrider)
    youthclassifications: Youthclassification[];

    @OneToMany(type => Mountainclassification, mountaincf  => mountaincf.tourrider)
    mountainclassifications: Mountainclassification[];

    @OneToMany(type => Pointsclassification, pointscf  => pointscf.tourrider)
    pointsclassifications: Pointsclassification[];
}
