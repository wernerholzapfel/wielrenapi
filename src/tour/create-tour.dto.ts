import {IsBoolean, IsDefined, IsString, IsDateString, Length, IsArray} from 'class-validator';
import { Tour } from './tour.entity';

export class CreateTourDto {
    readonly id: string;

    @IsDefined() @IsString() readonly tourName: string;

    @IsDefined() @IsDateString() readonly startDate: Date;

    @IsDefined() @IsDateString() readonly endDate: Date;

    @IsBoolean() readonly isActive: boolean;

}

export class AddTeamsRequestDto {
    @IsDefined() readonly tour: Tour;
    @IsDefined() @IsArray() readonly teams: any[];

}