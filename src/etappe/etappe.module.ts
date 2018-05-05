import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {Etappe} from './etappe.entity';
import {EtappeService} from './etappe.service';
import {EtappeController} from './etappe.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Etappe])],
    components: [EtappeService],
    controllers: [EtappeController],
})
export class EtappeModule {}