import {Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Tour} from '../tour/tour.entity';
import {Tourriders} from '../tourriders/tourriders.entity';

@Entity()
export class Rider {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    firstName: string;

    @Column('text')
    firstNameShort: string;

    @Column('text')
    initials: string;

    @Column('text')
    surName: string;

    @Column()
    nationality: string;

    @Column('text')
    surNameShort: string;

    @Column({type: 'date'})
    dateOfBirth: Date;

    @Column({default: true})
    isActive: boolean;

    @OneToMany(type => Tourriders, tourriders => tourriders.rider)
    tourRiders: Tourriders[];

}
