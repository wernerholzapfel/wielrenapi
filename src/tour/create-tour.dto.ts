import {IsBoolean, IsDefined, IsString, IsDateString, Length} from 'class-validator';

export class CreateTourDto {
    readonly id: string;

    @IsDefined() @IsString() readonly tourName: string;

    @IsDefined() @IsDateString() readonly startDate: Date;

    @IsDefined() @IsDateString() readonly endDate: Date;

    @IsBoolean() readonly isActive: boolean;

}