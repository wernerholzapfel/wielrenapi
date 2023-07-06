import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum FameType {
    WATERDRAGER = "waterdrager",
    WINNAARS = "winnaars",
    RENNER = "renner",
    JOKER = "joker",
}
@Entity()
export class Halloffame {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    rondeNaam: string;

    @Column('text', { nullable: true })
    ploegleider: string;

    @Column('text', { nullable: true })
    renner: string;

    @Column({ nullable: true })
    rennerPunten: number;

    @Column({ nullable: true })
    rennerWaarde: number;

    @Column('text', { nullable: true })
    ploeg: string;

    @Column({ nullable: true })
    order: number;

    @Column({ nullable: true })
    aantalDeelnemers: number;

    @Column({
        type: "enum",
        enum: FameType,
        default: FameType.RENNER
    })
    fameType: FameType;

    @UpdateDateColumn()
    updatedDate: Date;

    @CreateDateColumn()
    createdDate: Date;

}



