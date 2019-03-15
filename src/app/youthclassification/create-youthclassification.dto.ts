import {IsBoolean, IsDefined, IsString, IsDateString, Length} from 'class-validator';

export class CreateYouthclassificationDto {
    readonly id: string;

    @IsDefined() @IsString() readonly youthclassificationName: string;

    @IsDefined() @IsString() readonly youthclassificationNameShort: string;

    @IsDefined() @IsString() readonly country: string;

}