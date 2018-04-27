import {IsBoolean, IsDefined, IsString, IsDateString, Length} from 'class-validator';

export class CreateTourridersDto {
    readonly id: string;

    @IsDefined() @IsString() readonly tourridersName: string;

    @IsDefined() @IsDateString() readonly startDate: Date;

    @IsDefined() @IsDateString() readonly endDate: Date;

    @IsBoolean() readonly isActive: boolean;

}