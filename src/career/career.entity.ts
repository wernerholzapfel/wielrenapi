import { Participant } from '../participant/participant.entity';
import { Tour } from '../tour/tour.entity';
import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Career {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('decimal',{precision: 10, scale: 5})
    careerInitScore: number;
    
    @Column('decimal',{precision: 10, scale: 5})
    careerCurrentScore: number;

    @Index()
    @ManyToOne(type => Participant, participant => participant.career)
    participant: Participant;

    @Index()
    @ManyToOne(type => Tour, tour => tour.career)
    tour?: Tour;

    @UpdateDateColumn()
    updatedDate: Date;

    @CreateDateColumn()
    createdDate: Date;

}



