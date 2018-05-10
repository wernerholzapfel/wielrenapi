import {Controller} from '@nestjs/common/utils/decorators/controller.decorator';
import {Body, Get, Logger, Param, Post, Req} from '@nestjs/common';
import {EtappeService} from './etappe.service';
import {Etappe} from './etappe.entity';
import {CreateEtappeDto} from './create-etappe.dto';

@Controller('etappes')
export class EtappeController {
    private readonly logger = new Logger('EtappeController', true);

    constructor(private readonly etappeService: EtappeService) {
    }

    @Get()
    async findAll(): Promise<Etappe[]> {
        return this.etappeService.findAll();
    }


    @Get(':etappeId')
    async findByEtappe(@Param('etappeId') etappeId): Promise<Etappe> {
        return this.etappeService.findByEtappe(etappeId);
    }

    @Post()
    async create(@Req() req, @Body() createEtappeDto: CreateEtappeDto) {
        this.logger.log('post etappe');
        const newEtappe = Object.assign({}, createEtappeDto);
        return await this.etappeService.create(newEtappe);
    }
}