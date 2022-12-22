import {IsBoolean, IsDefined, IsString, IsDateString, Length, IsNumber} from 'class-validator';
import { Tour } from 'tour/tour.entity';

export class CreateEtappeDto {
    readonly id: string;

    @IsDefined() @IsString() readonly etappeName: string;

    @IsDefined() @IsNumber() readonly etappeNumber: number;

    @IsDefined() @IsString() readonly date: string;
    @IsDefined() readonly tour: Tour

}