import {Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Rider} from '../rider/rider.entity';
import {Tourriders} from '../tourriders/tourriders.entity';

@Entity()
export class Team {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    teamName: string;

    @Column('text')
    teamNameShort: string;

    @Column('text')
    country: string;

    @OneToMany(type => Tourriders, tourriders => tourriders.team)
    tourRiders: Tourriders[];

}
