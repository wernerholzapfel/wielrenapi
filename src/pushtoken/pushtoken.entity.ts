import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Participant} from "../participant/participant.entity";

@Entity()
@Index(['pushToken', 'participant'], {unique: true})
export class Pushtoken {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({select: false})
    pushToken: string;
    
    @Column({default: false})
    isDeleted: boolean

    @ManyToOne(type => Participant, participant => participant.predictions, {nullable: false})
    participant: Participant;

    @UpdateDateColumn({type: 'timestamptz'})
    updatedDate: Date;

    @CreateDateColumn({type: 'timestamptz'})
    createdDate: Date;
}
