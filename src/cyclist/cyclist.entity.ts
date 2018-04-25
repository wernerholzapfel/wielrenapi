import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Cyclist {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    firstName: string;

    @Column({length: 3})
    firstNameShort: string;

    @Column('text')
    initials: string;

    @Column('text')
    surName: string;

    @Column()
    nationality: string;

    @Column({length: 3})
    surNameShort: string;

    @Column({type: 'date'})
    dateOfBirth: Date;

    @Column({default: true})
    isActive: boolean;
}
