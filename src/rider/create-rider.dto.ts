import {IsBoolean, IsDefined, IsString, IsDateString, Length} from 'class-validator';

export class CreateRiderDto {
    readonly id: string;

    @IsDefined() @IsString() readonly firstName: string;

    @IsDefined() @IsString() readonly firstNameShort: string;

    @IsDefined() @IsString() readonly initials: string;

    @IsDefined() @IsString() readonly surName: string;

    @IsDefined() @IsString() readonly nationality: string;

    @IsDefined() @IsString() readonly surNameShort: string;

    @IsDefined() @IsDateString() readonly dateOfBirth: Date;

    @IsBoolean() readonly isActive: boolean;

}