import {IsBoolean, IsDefined, IsString, IsDateString, Length} from 'class-validator';

export class CreateStageclassificationDto {
    readonly id: string;

    @IsDefined() @IsString() readonly stageclassificationName: string;

    @IsDefined() @IsString() readonly stageclassificationNameShort: string;

    @IsDefined() @IsString() readonly country: string;

}