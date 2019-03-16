import {IsBoolean, IsDefined, IsString, IsDateString, Length} from 'class-validator';

export class CreateMountainclassificationDto {
    readonly id: string;

    @IsDefined() @IsString() readonly mountainclassificationName: string;

    @IsDefined() @IsString() readonly mountainclassificationNameShort: string;

    @IsDefined() @IsString() readonly country: string;

}