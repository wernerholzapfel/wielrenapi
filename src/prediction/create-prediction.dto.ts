import {IsBoolean, IsDefined, IsString, IsDateString, Length} from 'class-validator';
import {Rider} from '../rider/rider.entity';
import {Tour} from '../tour/tour.entity';

export class CreatePredictionDto {
    readonly id: string;

    @IsDefined() readonly beschermdeRenner: Rider;
    @IsDefined() readonly linkebal: Rider;
    @IsDefined() readonly meesterknecht: Rider;
    @IsDefined() readonly waterdrager: Rider;
    @IsDefined() readonly riders: Rider[];
    @IsDefined() readonly tour: Tour;

}