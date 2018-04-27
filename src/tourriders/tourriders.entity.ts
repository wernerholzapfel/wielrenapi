import {
    Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne,
    PrimaryGeneratedColumn
} from 'typeorm';
import {Rider} from '../rider/rider.entity';
import {Team} from '../teams/team.entity';
import {Tour} from '../tour/tour.entity';

@Entity()
@Index(['rider', 'tour', 'team' ], {unique: true})

export class Tourriders {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    waarde: number;

    @ManyToOne(type => Rider, rider => rider.tourRiders)
    rider: Rider;

    @ManyToOne(type => Tour, tour => tour.tourRiders)
    tour: Tour;

    @ManyToOne(type => Team, team => team.tourRiders)
    team: Team;
}
