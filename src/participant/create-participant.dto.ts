import {IsDefined, IsString} from 'class-validator';

export class CreateParticipantDto {
    readonly id: string;

    @IsDefined() @IsString() readonly email: string;

    @IsDefined() @IsString() readonly displayName: string;

    @IsDefined() @IsString() readonly teamName: string;

}


export class UpdateParticipantDto {
    readonly id: string;

    @IsDefined() @IsString() readonly displayName: string;

    @IsDefined() @IsString() readonly teamName: string;
}

export class AddPushTokenDto {
    @IsDefined() @IsString() readonly pushtoken: string;
}