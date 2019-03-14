
import {Body, Controller, Get, Logger, Post, Req} from '@nestjs/common';
import {RiderService} from './rider.service';
import {Rider} from './rider.entity';
import {CreateRiderDto} from './create-rider.dto';

@Controller('riders')
export class RiderController {
    private readonly logger = new Logger('RiderController', true);

    constructor(private readonly riderService: RiderService) {
    }

    @Get()
    async findAll(): Promise<Rider[]> {
        return this.riderService.findAll();
    }

    @Post()
    async create(@Req() req, @Body() createRiderDto: CreateRiderDto) {
        this.logger.log('post rider');
        const newRider = Object.assign({}, createRiderDto);
        return await this.riderService.create(newRider);
    }
}