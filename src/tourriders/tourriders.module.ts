import {CacheModule, Module} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {Tourriders} from './tourriders.entity';
import {TourridersService} from './tourriders.service';
import {TourridersController} from './tourriders.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Tourriders]),
        CacheModule.register({ttl: 0})],
    providers: [TourridersService],
    controllers: [TourridersController],
})
export class TourridersModule {}
