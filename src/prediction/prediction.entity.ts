import {Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Rider} from '../rider/rider.entity';
import {Tourriders} from '../tourriders/tourriders.entity';
import {Tour} from '../tour/tour.entity';
import {Participant} from '../participant/participant.entity';

@Entity()
export class Prediction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({default : false})
    isRider: boolean;

    @Column({default : false})
    isWaterdrager: boolean;

    @Column({default : false})
    isMeesterknecht: boolean;

    @Column({default : false})
    isLinkebal: boolean;

    @Column({default : false})
    isBeschermdeRenner: boolean;

    @ManyToOne(type => Tourriders, rider => rider.predictions)
    rider: Tourriders;

    @ManyToOne(type => Tour, tour => tour.predictions)
    tour: Tour;

    @ManyToOne(type => Participant, participant => participant.predictions)
    participant: Participant;
}
