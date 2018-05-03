import {IsBoolean, IsDefined, IsString, IsDateString, Length} from 'class-validator';

export class CreateParticipantDto {
    readonly id: string;

    @IsDefined() @IsString() readonly participantName: string;

    @IsDefined() @IsString() readonly participantNameShort: string;

    @IsDefined() @IsString() readonly country: string;

}