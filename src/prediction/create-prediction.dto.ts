import {IsBoolean, IsDefined, IsString, IsDateString, Length} from 'class-validator';
import {Rider} from '../rider/rider.entity';
import {Tour} from '../tour/tour.entity';

export class CreatePredictionDto {
    @IsDefined() readonly prediction: Rider;
    @IsDefined() readonly tour: Tour;
}
