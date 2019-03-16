
import {Body, Controller, Get, Logger, Param, Post, Req} from '@nestjs/common';
import {HeadlineService} from './headline.service';
import {Headline} from './headline.entity';
import {CreateHeadlineDto} from './create-headline.dto';
import {Mountainclassification} from '../mountainclassification/mountainclassification.entity';

@Controller('headlines')
export class HeadlinesController {
    private readonly logger = new Logger('HeadlinesController', true);

    constructor(private readonly headlineService: HeadlineService) {
    }

    @Get(':tourId')
    async findAll(@Param('tourId') tourId): Promise<Headline[]> {
        return this.headlineService.findAllByTourId(tourId);
    }

    @Post()
    async create(@Req() req, @Body() createHeadlineDto: CreateHeadlineDto) {
        this.logger.log('post headline');
        const newHeadline = Object.assign({}, createHeadlineDto, {schrijver: req.user.displayName});
        return await this.headlineService.create(newHeadline);
    }
}