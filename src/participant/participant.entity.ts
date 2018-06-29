import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Prediction} from '../prediction/prediction.entity';

@Entity()
export class Participant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({select: false})
    email: string;

    @Column({ nullable: true })
    displayName: string;

    @Column({ nullable: true })
    teamName: string;

    @OneToMany(type => Prediction, prediction => prediction.participant)
    predictions: Prediction[];

    // todo tours koppelen
}
