import {IsBoolean, IsDefined, IsString, IsDateString, Length} from 'class-validator';

export class CreateTourclassificationDto {
    readonly id: string;

    @IsDefined() @IsString() readonly tourclassificationName: string;

    @IsDefined() @IsString() readonly tourclassificationNameShort: string;

    @IsDefined() @IsString() readonly country: string;

}