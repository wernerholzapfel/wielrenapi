import {IsBoolean, IsDefined, IsString, IsDateString, Length} from 'class-validator';

export class CreateCyclistDto {
    readonly id: string;

    @IsDefined() @IsString() readonly firstName: string;

    @IsDefined() @IsString() @Length(3, 3) readonly firstNameShort: string;

    @IsDefined() @IsString() @Length(2, 3) readonly initials: string;

    @IsDefined() @IsString() readonly surName: string;

    @IsDefined() @IsString() readonly nationality: string;

    @IsDefined() @IsString() @Length(2, 3) readonly surNameShort: string;

    @IsDefined() @IsDateString() readonly dateOfBirth: Date;

    @IsBoolean() readonly isActive: boolean;

}