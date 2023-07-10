import {Body, Controller, Get, Param, Post, Put, Req} from '@nestjs/common';
import {Stageclassification} from '../stageclassification/stageclassification.entity';
import {StageclassificationService} from '../stageclassification/stageclassification.service';
import {PredictionScoreService} from './prediction-score.service';

@Controller('prediction-score')
export class PredictionScoreController {

    constructor(private readonly predictionsScoreService: PredictionScoreService) {
    }
    @Get('etappe/:etappeId')
    async getEtappeStand(@Param('etappeId') etappeId): Promise<Stageclassification[]> {
        return this.predictionsScoreService.getEtappeStand(etappeId);
    }
    @Get('latestetappe/:tourId')
    async getLatestEtappeStand(@Param('tourId') tourId): Promise<Stageclassification[]> {
        return this.predictionsScoreService.getLatestEtappeStand(tourId);
    }
    @Get('etappetotaal/:tourId/participant/:participantId/')
    async getTotalEtappePointsForParticipant(@Param('participantId') participantId, @Param('tourId') tourId): Promise<Stageclassification[]> {
        return this.predictionsScoreService.getTotalEtappePointsForParticipant(tourId, participantId);
    }

    @Get('etappe/:etappeId/participant/:participantid/tour/:tourid')
    async getEtappePointsForParticipant(@Param('etappeId') etappeId, @Param('tourid') tourid, @Param('participantid') participantid, @Req() req): Promise<Stageclassification[]> {
        return this.predictionsScoreService.getEtappePointsForParticipant(etappeId,tourid, participantid);
    }
     @Get(':predictionType/participant/:participantid/tour/:tourid')
    async getPredictionScoresPointsForParticipant(@Param('predictionType') predictionType, @Param('tourid') tourid, @Param('participantid') participantid, @Req() req): Promise<Stageclassification[]> {
        return this.predictionsScoreService.getPredictionScoresPointsForParticipant(predictionType, tourid, participantid);
    }
    @Get('totaal/:tourId')
    async getTotaalStand(@Param('tourId') tourId): Promise<Stageclassification[]> {
        return this.predictionsScoreService.getTotaalStand(tourId);
    }
    
    @Get('totaal/:tourId/carriere')
    async getCarriere(@Param('tourId') tourId): Promise<Stageclassification[]> {
        return this.predictionsScoreService.getCarriere(tourId);
    }
    @Get('totaal/:tourId/participant/:participantId')
    async getTotaalStandForParticipant(@Param('tourId') tourId, @Param('participantId') participantId): Promise<Stageclassification[]> {
        return this.predictionsScoreService.getTotaalStandForParticipant(tourId, participantId);
    }

    @Get(':tourId/participant/:participantId')
    async getTeamForParticipant(@Param('tourId') tourId, @Param('participantId') participantId): Promise<any[]> {
        return this.predictionsScoreService.getTeamForParticipant(tourId, participantId);
    }

    @Get('algemeen/:tourId')
    async getAlgemeenStand(@Param('tourId') tourId): Promise<Stageclassification[]> {
        return this.predictionsScoreService.getAlgemeenStand(tourId);
    }
    @Get('berg/:tourId')
    async getBergStand(@Param('tourId') tourId): Promise<Stageclassification[]> {
        return this.predictionsScoreService.getBergStand(tourId);
    }
    @Get('punten/:tourId')
    async getPuntenStand(@Param('tourId') tourId): Promise<Stageclassification[]> {
        return this.predictionsScoreService.getPuntenStand(tourId);
    }
    @Get('jongeren/:tourId')
    async getJongerenStand(@Param('tourId') tourId): Promise<Stageclassification[]> {
        return this.predictionsScoreService.getJongerenStand(tourId);
    }

    @Put('algemeen/:tourId')
    async putAlgemeenStand(@Param('tourId') tourId): Promise<Stageclassification[]> {
        return this.predictionsScoreService.updatePredictionScoreAlgemeen(tourId);
    }
    @Put('berg/:tourId')
    async putBergStand(@Param('tourId') tourId): Promise<Stageclassification[]> {
        return this.predictionsScoreService.updatePredictionScoreBerg(tourId);
    }
    @Put('punten/:tourId')
    async putPuntenStand(@Param('tourId') tourId): Promise<Stageclassification[]> {
        return this.predictionsScoreService.updatePredictionScorePunten(tourId);
    }
    @Put('jongeren/:tourId')
    async putJongerenStand(@Param('tourId') tourId): Promise<Stageclassification[]> {
        return this.predictionsScoreService.updatePredictionScoreJongeren(tourId);
    }

    @Put('etappe/:tourId/:etappeId')
    async create(@Req() req, @Param('etappeId') etappeId, @Param('tourId') tourId) {
        return await this.predictionsScoreService.updatePredictionScoreEtappe(etappeId, tourId);
    }
}
