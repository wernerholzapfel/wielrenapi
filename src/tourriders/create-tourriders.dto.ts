import {IsDefined, IsNumber, IsOptional} from 'class-validator';
import {Rider} from '../rider/rider.entity';
import {Tour} from '../tour/tour.entity';
import {Team} from '../teams/team.entity';
import { Etappe } from 'etappe/etappe.entity';

export class CreateTourridersDto {
    readonly id: string;

    @IsDefined() @IsNumber()
    readonly waarde: number;

    @IsDefined()
    readonly rider: Rider;

    @IsDefined()
    readonly tour: Tour;

    @IsDefined()
    readonly team: Team;
}