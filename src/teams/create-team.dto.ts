import {IsBoolean, IsDefined, IsString, IsDateString, Length} from 'class-validator';

export class CreateTeamDto {
    readonly id: string;

    @IsDefined() @IsString() readonly teamName: string;

    @IsDefined() @IsString() readonly teamNameShort: string;

    @IsDefined() @IsString() readonly country: string;

}