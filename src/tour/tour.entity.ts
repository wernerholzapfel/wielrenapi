import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Rider} from '../rider/rider.entity';
import {Team} from '../teams/team.entity';
import {Tourriders} from '../tourriders/tourriders.entity';

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

    @ManyToMany(type => Team)
    @JoinTable()
    teams: Team[];
}
