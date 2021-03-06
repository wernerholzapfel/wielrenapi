import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Prediction} from '../prediction/prediction.entity';
import {Tour} from '../tour/tour.entity';
import {Stageclassification} from '../stageclassification/stageclassification.entity';
import {Tourriders} from '../tourriders/tourriders.entity';

@Entity()
export class Etappe {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    etappeNumber: number;

    @Column()
    etappeName: string;

    @Column({type: 'date'})
    date: Date;

    @Column({ nullable: true })
    type: string;

    @Column({ nullable: true })
    isDriven: boolean;

    @ManyToOne(type => Tour, tour => tour.etappes)
    tour: Tour;

    @OneToMany(type => Stageclassification, stagecf  => stagecf.etappe)
    stageclassifications: Stageclassification[];

    @OneToMany(type => Tourriders, tourriders => tourriders.rider)
    tourridersout: Tourriders[];
}
