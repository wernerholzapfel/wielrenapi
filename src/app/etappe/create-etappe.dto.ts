import {IsBoolean, IsDefined, IsString, IsDateString, Length} from 'class-validator';

export class CreateEtappeDto {
    readonly id: string;

    @IsDefined() @IsString() readonly etappeName: string;

    @IsDefined() @IsString() readonly etappeNameShort: string;

    @IsDefined() @IsString() readonly country: string;

}