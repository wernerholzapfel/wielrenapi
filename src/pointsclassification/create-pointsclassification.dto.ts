import {IsBoolean, IsDefined, IsString, IsDateString, Length} from 'class-validator';

export class CreatePointsclassificationDto {
    readonly id: string;

    @IsDefined() @IsString() readonly pointsclassificationName: string;

    @IsDefined() @IsString() readonly pointsclassificationNameShort: string;

    @IsDefined() @IsString() readonly country: string;

}