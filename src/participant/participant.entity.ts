import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Prediction} from '../prediction/prediction.entity';

@Entity()
export class Participant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    email: string;

    @OneToMany(type => Prediction, prediction => prediction.participant)
    predictions: Prediction[];

    // todo tours koppelen
}
