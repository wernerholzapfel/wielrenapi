import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Prediction} from '../prediction/prediction.entity';
import {Tour} from '../tour/tour.entity';

@Entity()
export class Etappe {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    etappeName: string;

    @Column({type: 'date'})
    date: Date;

    @Column({ nullable: true })
    type: string;

    @ManyToOne(type => Tour, tour => tour.etappes)
    tour: Tour;
}
