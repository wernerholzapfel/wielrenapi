
import {Body, CacheInterceptor, Controller, Get, Logger, Param, Post, Req, UseInterceptors} from '@nestjs/common';
import {ParticipantService} from './participant.service';
import {Participant} from './participant.entity';
import {CreateParticipantDto} from './create-participant.dto';
import {Tour} from '../tour/tour.entity';
import {Prediction} from '../prediction/prediction.entity';

@Controller('participants')
export class ParticipantController {
    private readonly logger = new Logger('ParticipantController', true);

    constructor(private readonly participantService: ParticipantService) {
    }

    @Get('loggedIn')
    async findByParticipant(@Req() req): Promise<Participant> {
        return this.participantService.loggedIn(req.user.email);
    }
    @Get('/:tourId')
    async findAll(@Param('tourId') tourId): Promise<Participant[]> {
        return this.participantService.findAll(tourId);
    }

    @Get('/table/:id')
    async getTable(@Param('id') id): Promise<any[]> {
        if (id === 'ad756953-cb34-48bb-bbea-4dd52b993598') {
            return [];
        }
         if (id === '52acae2f-a69d-467d-a5ef-1ecd304436e3') {
            return [{
                "id": "e1338a03-6526-487a-9fca-93a49949cb85",
                "displayName": "Jip Schwering",
                "teamName": "Hupsende Hippies",
                "predictions": [{
                    "id": "b06681bb-c708-4912-b332-4ff522159155",
                    "isRider": false,
                    "isWaterdrager": false,
                    "isMeesterknecht": true,
                    "isLinkebal": false,
                    "isBeschermdeRenner": false,
                    "isComplete": true,
                    "totalStagePoints": -107,
                    "deltaStagePoints": 0
                }, {
                    "id": "1d12234e-cf6f-42df-9e85-48ab78756139",
                    "isRider": true,
                    "isWaterdrager": false,
                    "isMeesterknecht": false,
                    "isLinkebal": false,
                    "isBeschermdeRenner": false,
                    "isComplete": true,
                    "pointsPoints": 48,
                    "totalStagePoints": 166,
                    "deltaStagePoints": 30
                }, {
                    "id": "fe2ed532-cc46-4b78-b9bf-6572ad4f0793",
                    "isRider": true,
                    "isWaterdrager": false,
                    "isMeesterknecht": false,
                    "isLinkebal": false,
                    "isBeschermdeRenner": false,
                    "isComplete": true,
                    "youthPoints": 42,
                    "mountainPoints": 56,
                    "totalStagePoints": 34,
                    "deltaStagePoints": 0
                }, {
                    "id": "30b6bf9e-6ae0-40ad-9414-1eb7947b2716",
                    "isRider": true,
                    "isWaterdrager": false,
                    "isMeesterknecht": false,
                    "isLinkebal": false,
                    "isBeschermdeRenner": false,
                    "isComplete": true,
                    "mountainPoints": 32,
                    "pointsPoints": 16,
                    "totalStagePoints": 104,
                    "deltaStagePoints": 0
                }, {
                    "id": "c886c591-bdf0-4682-aea3-35077ffff576",
                    "isRider": true,
                    "isWaterdrager": false,
                    "isMeesterknecht": false,
                    "isLinkebal": false,
                    "isBeschermdeRenner": false,
                    "isComplete": true,
                    "tourPoints": 70,
                    "youthPoints": 51,
                    "pointsPoints": 24,
                    "totalStagePoints": 216,
                    "deltaStagePoints": 0
                }, {
                    "id": "4fea7578-9fe0-44c9-a7b2-eb6eb332491b",
                    "isRider": true,
                    "isWaterdrager": false,
                    "isMeesterknecht": false,
                    "isLinkebal": false,
                    "isBeschermdeRenner": false,
                    "isComplete": true,
                    "pointsPoints": 120,
                    "totalStagePoints": 446,
                    "deltaStagePoints": 52
                }, {
                    "id": "7ed3ea62-dc54-4779-a7dd-c93d64466207",
                    "isRider": true,
                    "isWaterdrager": false,
                    "isMeesterknecht": false,
                    "isLinkebal": false,
                    "isBeschermdeRenner": false,
                    "isComplete": true,
                    "tourPoints": 85,
                    "youthPoints": 66,
                    "totalStagePoints": 176,
                    "deltaStagePoints": 0
                }, {
                    "id": "91187b42-27d2-4872-a2c9-2809c7535f2f",
                    "isRider": false,
                    "isWaterdrager": false,
                    "isMeesterknecht": false,
                    "isLinkebal": false,
                    "isBeschermdeRenner": true,
                    "isComplete": true,
                    "tourPoints": 95,
                    "mountainPoints": 52,
                    "pointsPoints": 32,
                    "totalStagePoints": 236,
                    "deltaStagePoints": 0
                }, {
                    "id": "cd1f4a46-c471-4810-81ac-29157df7cbe0",
                    "isRider": true,
                    "isWaterdrager": false,
                    "isMeesterknecht": false,
                    "isLinkebal": false,
                    "isBeschermdeRenner": false,
                    "isComplete": true,
                    "pointsPoints": 12,
                    "totalStagePoints": 146,
                    "deltaStagePoints": 20
                }, {
                    "id": "78410d59-716a-45f8-9321-7c624a088484",
                    "isRider": true,
                    "isWaterdrager": false,
                    "isMeesterknecht": false,
                    "isLinkebal": false,
                    "isBeschermdeRenner": false,
                    "isComplete": true,
                    "pointsPoints": 56,
                    "totalStagePoints": 210,
                    "deltaStagePoints": 44
                }, {
                    "id": "0c4117ae-bc74-49a8-9226-3cf79c9e165d",
                    "isRider": true,
                    "isWaterdrager": false,
                    "isMeesterknecht": false,
                    "isLinkebal": false,
                    "isBeschermdeRenner": false,
                    "isComplete": true,
                    "totalStagePoints": 94,
                    "deltaStagePoints": 0
                }, {
                    "id": "e86feafc-9c1d-4267-b51d-1aa7dddd45d5",
                    "isRider": true,
                    "isWaterdrager": false,
                    "isMeesterknecht": false,
                    "isLinkebal": false,
                    "isBeschermdeRenner": false,
                    "isComplete": true,
                    "tourPoints": 150,
                    "youthPoints": 90,
                    "mountainPoints": 68,
                    "pointsPoints": 76,
                    "totalStagePoints": 388,
                    "deltaStagePoints": 0
                }, {
                    "id": "6bbc9e66-7af5-4a68-b748-e9d7287005f7",
                    "isRider": true,
                    "isWaterdrager": false,
                    "isMeesterknecht": false,
                    "isLinkebal": false,
                    "isBeschermdeRenner": false,
                    "isComplete": true,
                    "totalStagePoints": 42,
                    "deltaStagePoints": 0
                }, {
                    "id": "1cc4da44-acf3-41ba-881d-161f0b14bbaa",
                    "isRider": false,
                    "isWaterdrager": true,
                    "isMeesterknecht": false,
                    "isLinkebal": false,
                    "isBeschermdeRenner": false,
                    "isComplete": true,
                    "tourPoints": -19,
                    "mountainPoints": -18,
                    "youthPoints": -27,
                    "pointsPoints": -24,
                    "totalStagePoints": 77,
                    "deltaStagePoints": 3
                }, {
                    "id": "8b0f4234-7140-492f-ab91-b18396db2857",
                    "isRider": false,
                    "isWaterdrager": false,
                    "isMeesterknecht": false,
                    "isLinkebal": true,
                    "isBeschermdeRenner": false,
                    "isComplete": true,
                    "totalStagePoints": 24,
                    "deltaStagePoints": 0
                }],
                "totalPoints": 3405,
                "totalStagePoints": 2252,
                "totalTourPoints": 381,
                "totalMountainPoints": 190,
                "totalYouthPoints": 222,
                "totalPointsPoints": 360,
                "deltaTotalStagePoints": 1302,
                "previousTotalPoints": 2103,
                "previousPosition": 1,
                "position": 1
            }, {
                "id": "95f4d375-cc92-4dac-918b-f8d0073e2844",
                "displayName": "Ed R.",
                "teamName": "Ride for Roos",
                "totalPoints": 2996,
                "totalStagePoints": 1950,
                "totalTourPoints": 405,
                "totalMountainPoints": 248,
                "totalYouthPoints": 101,
                "totalPointsPoints": 292,
                "deltaTotalStagePoints": 1103,
                "previousTotalPoints": 1893,
                "previousPosition": 2,
                "position": 2
            }, {
                "id": "64891092-40eb-4d32-a4dd-7998505d84f4",
                "displayName": "Werner",
                "teamName": "Winvictis",
                "totalPoints": 2978,
                "totalStagePoints": 1831,
                "totalTourPoints": 341,
                "totalMountainPoints": 310,
                "totalYouthPoints": 200,
                "totalPointsPoints": 296,
                "deltaTotalStagePoints": 1205,
                "previousTotalPoints": 1773,
                "previousPosition": 4,
                "position": 3
            }, {
                "id": "76d3be6c-64db-42bf-aef3-6d6236a0b9e9",
                "displayName": "Peter Smets",
                "teamName": "Bardepiet",
                "totalPoints": 2930,
                "totalStagePoints": 1836,
                "totalTourPoints": 275,
                "totalMountainPoints": 268,
                "totalYouthPoints": 215,
                "totalPointsPoints": 336,
                "deltaTotalStagePoints": 1179,
                "previousTotalPoints": 1751,
                "previousPosition": 6,
                "position": 4
            }, {
                "id": "ff0ffe13-7405-42d6-9c91-b16ca87e56ab",
                "displayName": "Lodewijk Nederpel",
                "teamName": "Team 038",
                "totalPoints": 2821,
                "totalStagePoints": 1781,
                "totalTourPoints": 395,
                "totalMountainPoints": 219,
                "totalYouthPoints": 263,
                "totalPointsPoints": 163,
                "deltaTotalStagePoints": 1059,
                "previousTotalPoints": 1762,
                "previousPosition": 5,
                "position": 5
            }, {
                "id": "9b9c4594-c6ba-4af7-b787-fb0f3839434e",
                "displayName": "Mart",
                "teamName": "Marttram",
                "totalPoints": 2737,
                "totalStagePoints": 1795,
                "totalTourPoints": 361,
                "totalMountainPoints": 162,
                "totalYouthPoints": 279,
                "totalPointsPoints": 140,
                "deltaTotalStagePoints": 989,
                "previousTotalPoints": 1748,
                "previousPosition": 7,
                "position": 6
            }, {
                "id": "a4fb1538-a98a-41b9-a866-c5f114972c54",
                "displayName": "Terry Dieperink",
                "teamName": "Vamos Vamos Vamos!!",
                "totalPoints": 2614,
                "totalStagePoints": 1922,
                "totalTourPoints": 221,
                "totalMountainPoints": 98,
                "totalYouthPoints": 153,
                "totalPointsPoints": 220,
                "deltaTotalStagePoints": 781,
                "previousTotalPoints": 1833,
                "previousPosition": 3,
                "position": 7
            }, {
                "id": "8b91104f-de9f-4527-8f61-dbf8f6e81407",
                "displayName": "Pieter de Graaf",
                "teamName": "Jajayejaja",
                "totalPoints": 2605,
                "totalStagePoints": 1857,
                "totalTourPoints": 159,
                "totalMountainPoints": 168,
                "totalYouthPoints": 129,
                "totalPointsPoints": 292,
                "deltaTotalStagePoints": 881,
                "previousTotalPoints": 1724,
                "previousPosition": 9,
                "position": 8
            }, {
                "id": "61603ede-1d59-4e52-91ca-a049411132d3",
                "displayName": "Wouter Boerema",
                "teamName": "Wouter",
                "totalPoints": 2567,
                "totalStagePoints": 1377,
                "totalTourPoints": 475,
                "totalMountainPoints": 405,
                "totalYouthPoints": 121,
                "totalPointsPoints": 189,
                "deltaTotalStagePoints": 1166,
                "previousTotalPoints": 1401,
                "previousPosition": 20,
                "position": 9
            }, {
                "id": "91b235f4-4b74-4650-850e-df4764921a91",
                "displayName": "Ronald Staring",
                "teamName": "* * * Trankilo * * *",
                "totalPoints": 2501,
                "totalStagePoints": 1690,
                "totalTourPoints": 361,
                "totalMountainPoints": 218,
                "totalYouthPoints": 72,
                "totalPointsPoints": 160,
                "deltaTotalStagePoints": 828,
                "previousTotalPoints": 1673,
                "previousPosition": 10,
                "position": 10
            }, {
                "id": "30f19578-cb77-4831-8692-2c806be980dc",
                "displayName": "Wim Dommerholt",
                "teamName": "Quissais",
                "totalPoints": 2417,
                "totalStagePoints": 1529,
                "totalTourPoints": 335,
                "totalMountainPoints": 172,
                "totalYouthPoints": 173,
                "totalPointsPoints": 208,
                "deltaTotalStagePoints": 941,
                "previousTotalPoints": 1476,
                "previousPosition": 14,
                "position": 11
            }, {
                "id": "65fa25a7-91fc-4a0f-864a-0d94a4421804",
                "displayName": "Francis Stalpers",
                "teamName": "AIAIAI",
                "totalPoints": 2409,
                "totalStagePoints": 1778,
                "totalTourPoints": 86,
                "totalMountainPoints": 190,
                "totalYouthPoints": 59,
                "totalPointsPoints": 296,
                "deltaTotalStagePoints": 771,
                "previousTotalPoints": 1638,
                "previousPosition": 11,
                "position": 12
            }, {
                "id": "cb80576c-e723-4959-b22e-b6a93bbb63a2",
                "displayName": "Harrie Houtbeckers",
                "teamName": "Woody Woodpecker",
                "totalPoints": 2398,
                "totalStagePoints": 1858,
                "totalTourPoints": 220,
                "totalMountainPoints": -3,
                "totalYouthPoints": 166,
                "totalPointsPoints": 157,
                "deltaTotalStagePoints": 651,
                "previousTotalPoints": 1747,
                "previousPosition": 8,
                "position": 13
            }, {
                "id": "a1e79b17-c3d3-43ef-89df-fdbb43bfc7fc",
                "displayName": "Jan Dijkerman",
                "teamName": "Jan Dijkerman",
                "totalPoints": 2347,
                "totalStagePoints": 1709,
                "totalTourPoints": 285,
                "totalMountainPoints": 107,
                "totalYouthPoints": -25,
                "totalPointsPoints": 271,
                "deltaTotalStagePoints": 771,
                "previousTotalPoints": 1576,
                "previousPosition": 12,
                "position": 14
            }, {
                "id": "419f0ac8-99aa-4a25-8da7-a7d47212d8e6",
                "displayName": "Robin Wennekes",
                "teamName": "53x11",
                "totalPoints": 2331,
                "totalStagePoints": 1506,
                "totalTourPoints": 200,
                "totalMountainPoints": 328,
                "totalYouthPoints": 89,
                "totalPointsPoints": 208,
                "deltaTotalStagePoints": 882,
                "previousTotalPoints": 1449,
                "previousPosition": 16,
                "position": 15
            }, {
                "id": "ce84525e-3b79-468c-812b-b64068cf079c",
                "displayName": "Erik de Jong",
                "teamName": "DemarrErik",
                "totalPoints": 2314,
                "totalStagePoints": 1394,
                "totalTourPoints": 365,
                "totalMountainPoints": 238,
                "totalYouthPoints": 188,
                "totalPointsPoints": 129,
                "deltaTotalStagePoints": 932,
                "previousTotalPoints": 1382,
                "previousPosition": 23,
                "position": 16
            }, {
                "id": "ea3b6507-6503-48ca-9709-da4cad867672",
                "displayName": "gijs",
                "teamName": "gijspan",
                "totalPoints": 2256,
                "totalStagePoints": 1517,
                "totalTourPoints": 270,
                "totalMountainPoints": 134,
                "totalYouthPoints": 137,
                "totalPointsPoints": 198,
                "deltaTotalStagePoints": 805,
                "previousTotalPoints": 1451,
                "previousPosition": 15,
                "position": 17
            }, {
                "id": "a9aac26b-9f5b-4359-b2bf-6e059fa6c618",
                "displayName": "Wynand Berndsen",
                "teamName": "Los Picos de Europa",
                "totalPoints": 2227,
                "totalStagePoints": 1463,
                "totalTourPoints": 285,
                "totalMountainPoints": 131,
                "totalYouthPoints": 65,
                "totalPointsPoints": 283,
                "deltaTotalStagePoints": 791,
                "previousTotalPoints": 1436,
                "previousPosition": 19,
                "position": 18
            }, {
                "id": "1abb79dd-2a6e-4177-aa6a-6eece3e172f0",
                "displayName": "Dajo Rodrigo",
                "teamName": "Rodrigo Riders",
                "totalPoints": 2208,
                "totalStagePoints": 1378,
                "totalTourPoints": 335,
                "totalMountainPoints": 191,
                "totalYouthPoints": 185,
                "totalPointsPoints": 119,
                "deltaTotalStagePoints": 865,
                "previousTotalPoints": 1343,
                "previousPosition": 26,
                "position": 19
            }, {
                "id": "0c511abf-f18a-400d-9260-9c3d1c0a47b5",
                "displayName": "Kees",
                "teamName": "Kees",
                "totalPoints": 2127,
                "totalStagePoints": 1481,
                "totalTourPoints": 271,
                "totalMountainPoints": 82,
                "totalYouthPoints": 141,
                "totalPointsPoints": 152,
                "deltaTotalStagePoints": 679,
                "previousTotalPoints": 1448,
                "previousPosition": 17,
                "position": 20
            }, {
                "id": "6d5afd4c-690e-47d1-a9cc-48722012e0a9",
                "displayName": "Eric van Vliet",
                "teamName": "The Young Ones",
                "totalPoints": 2122,
                "totalStagePoints": 1425,
                "totalTourPoints": 266,
                "totalMountainPoints": 146,
                "totalYouthPoints": 213,
                "totalPointsPoints": 72,
                "deltaTotalStagePoints": 724,
                "previousTotalPoints": 1398,
                "previousPosition": 21,
                "position": 21
            }, {
                "id": "a5c5489f-e5f8-4991-b962-2b0344ca0013",
                "displayName": "M P H Sillekens  Marcel",
                "teamName": "Wodka Cows",
                "totalPoints": 2116,
                "totalStagePoints": 1345,
                "totalTourPoints": 309,
                "totalMountainPoints": 118,
                "totalYouthPoints": 200,
                "totalPointsPoints": 144,
                "deltaTotalStagePoints": 796,
                "previousTotalPoints": 1320,
                "previousPosition": 27,
                "position": 22
            }, {
                "id": "6f29dd22-9b5e-49cc-b0b3-6ea4fd871980",
                "displayName": "Hetger de Jonge",
                "teamName": "pirazzi",
                "totalPoints": 2115,
                "totalStagePoints": 1464,
                "totalTourPoints": 195,
                "totalMountainPoints": 103,
                "totalYouthPoints": 170,
                "totalPointsPoints": 183,
                "deltaTotalStagePoints": 720,
                "previousTotalPoints": 1395,
                "previousPosition": 22,
                "position": 23
            }, {
                "id": "a94ab0af-54ba-4c00-8ff1-a2a283e9bcd0",
                "displayName": "Tom Dijkerman",
                "teamName": "De Dijk Op",
                "totalPoints": 2107,
                "totalStagePoints": 1481,
                "totalTourPoints": 270,
                "totalMountainPoints": 107,
                "totalYouthPoints": 194,
                "totalPointsPoints": 55,
                "deltaTotalStagePoints": 661,
                "previousTotalPoints": 1446,
                "previousPosition": 18,
                "position": 24
            }, {
                "id": "438a1d3e-f6ff-4c08-b631-16a929c76052",
                "displayName": "beerens",
                "teamName": "beerens",
                "totalPoints": 2087,
                "totalStagePoints": 1399,
                "totalTourPoints": 105,
                "totalMountainPoints": 260,
                "totalYouthPoints": 92,
                "totalPointsPoints": 231,
                "deltaTotalStagePoints": 778,
                "previousTotalPoints": 1309,
                "previousPosition": 28,
                "position": 25
            }, {
                "id": "f1dc0b79-28cc-4ede-8212-4742aee882f7",
                "displayName": "Sara",
                "teamName": "* * * Tour de Faso * * *",
                "totalPoints": 2061,
                "totalStagePoints": 1829,
                "totalTourPoints": -25,
                "totalMountainPoints": -25,
                "totalYouthPoints": -25,
                "totalPointsPoints": 307,
                "deltaTotalStagePoints": 495,
                "previousTotalPoints": 1566,
                "previousPosition": 13,
                "position": 26
            }, {
                "id": "8864cd5c-4bdf-4f5f-9f64-87e2c222a884",
                "displayName": "Gerard Meijers ",
                "teamName": "BiniCaraPoel",
                "totalPoints": 2039,
                "totalStagePoints": 1329,
                "totalTourPoints": 221,
                "totalMountainPoints": 129,
                "totalYouthPoints": 166,
                "totalPointsPoints": 194,
                "deltaTotalStagePoints": 800,
                "previousTotalPoints": 1239,
                "previousPosition": 30,
                "position": 27
            }, {
                "id": "da7e74ca-d6eb-4f79-89bb-2ea9e4e1f477",
                "displayName": "René",
                "teamName": "Mountainbike",
                "totalPoints": 1958,
                "totalStagePoints": 1128,
                "totalTourPoints": 226,
                "totalMountainPoints": 330,
                "totalYouthPoints": 170,
                "totalPointsPoints": 104,
                "deltaTotalStagePoints": 806,
                "previousTotalPoints": 1152,
                "previousPosition": 37,
                "position": 28
            }, {
                "id": "205d209c-eca5-4092-9211-305ad43eee59",
                "displayName": "Jan Dinkelman",
                "teamName": "Tour Dinkelman ",
                "totalPoints": 1882,
                "totalStagePoints": 1209,
                "totalTourPoints": 245,
                "totalMountainPoints": 195,
                "totalYouthPoints": 110,
                "totalPointsPoints": 123,
                "deltaTotalStagePoints": 678,
                "previousTotalPoints": 1204,
                "previousPosition": 34,
                "position": 29
            }, {
                "id": "eb6f9744-c9f9-4eee-8ca4-a6f20a2068b2",
                "displayName": "Peter Schieven",
                "teamName": "PeterS",
                "totalPoints": 1874,
                "totalStagePoints": 1355,
                "totalTourPoints": 184,
                "totalMountainPoints": 28,
                "totalYouthPoints": 195,
                "totalPointsPoints": 112,
                "deltaTotalStagePoints": 584,
                "previousTotalPoints": 1290,
                "previousPosition": 29,
                "position": 30
            }, {
                "id": "754c59ac-ab83-445c-aa79-ee6cf4e1595f",
                "displayName": "Walter poppelaars",
                "teamName": "Walter79",
                "totalPoints": 1864,
                "totalStagePoints": 1470,
                "totalTourPoints": 110,
                "totalMountainPoints": 59,
                "totalYouthPoints": 98,
                "totalPointsPoints": 127,
                "deltaTotalStagePoints": 514,
                "previousTotalPoints": 1350,
                "previousPosition": 25,
                "position": 31
            }, {
                "id": "fe92d8f9-16bb-4ead-adcc-f7d0efb41162",
                "displayName": "Rudi Pierik",
                "teamName": "Stoempen",
                "totalPoints": 1798,
                "totalStagePoints": 1051,
                "totalTourPoints": 251,
                "totalMountainPoints": 202,
                "totalYouthPoints": 122,
                "totalPointsPoints": 172,
                "deltaTotalStagePoints": 753,
                "previousTotalPoints": 1045,
                "previousPosition": 40,
                "position": 32
            }, {
                "id": "53b4654b-9189-4dc4-bd87-535f5fa4b059",
                "displayName": "Maarten Dinkelman",
                "teamName": "Dinkelman",
                "totalPoints": 1797,
                "totalStagePoints": 1226,
                "totalTourPoints": 220,
                "totalMountainPoints": 91,
                "totalYouthPoints": 185,
                "totalPointsPoints": 75,
                "deltaTotalStagePoints": 614,
                "previousTotalPoints": 1183,
                "previousPosition": 36,
                "position": 33
            }, {
                "id": "d068666b-a9bf-4fdd-92b5-8c91c39310bf",
                "displayName": "Martin",
                "teamName": "Glomsers Glorie",
                "totalPoints": 1791,
                "totalStagePoints": 1232,
                "totalTourPoints": 351,
                "totalMountainPoints": 70,
                "totalYouthPoints": 102,
                "totalPointsPoints": 36,
                "deltaTotalStagePoints": 562,
                "previousTotalPoints": 1229,
                "previousPosition": 31,
                "position": 34
            }, {
                "id": "75118784-ef59-4ecd-92c4-0ba2ed648cdd",
                "displayName": "Gerda Dommerholt",
                "teamName": "Whoknows ",
                "totalPoints": 1741,
                "totalStagePoints": 1484,
                "totalTourPoints": 11,
                "totalMountainPoints": 158,
                "totalYouthPoints": -36,
                "totalPointsPoints": 124,
                "deltaTotalStagePoints": 376,
                "previousTotalPoints": 1365,
                "previousPosition": 24,
                "position": 35
            }, {
                "id": "113b373f-4a32-4714-b1af-961fd8b38416",
                "displayName": "Joris Kagie ",
                "teamName": "Kagie la vuelta ",
                "totalPoints": 1719,
                "totalStagePoints": 958,
                "totalTourPoints": 290,
                "totalMountainPoints": 168,
                "totalYouthPoints": 179,
                "totalPointsPoints": 124,
                "deltaTotalStagePoints": 766,
                "previousTotalPoints": 953,
                "previousPosition": 43,
                "position": 36
            }, {
                "id": "c1690698-e290-486c-a4af-5b20466c73a5",
                "displayName": "Fierens Paul",
                "teamName": "bastaix",
                "totalPoints": 1661,
                "totalStagePoints": 1284,
                "totalTourPoints": 105,
                "totalMountainPoints": 88,
                "totalYouthPoints": 17,
                "totalPointsPoints": 167,
                "deltaTotalStagePoints": 433,
                "previousTotalPoints": 1228,
                "previousPosition": 32,
                "position": 37
            }, {
                "id": "8019f9e6-3554-415a-be36-52af5362ed0c",
                "displayName": "Alfred",
                "teamName": "Nakkers",
                "totalPoints": 1659,
                "totalStagePoints": 1236,
                "totalTourPoints": 195,
                "totalMountainPoints": 52,
                "totalYouthPoints": 116,
                "totalPointsPoints": 60,
                "deltaTotalStagePoints": 466,
                "previousTotalPoints": 1193,
                "previousPosition": 35,
                "position": 38
            }, {
                "id": "24d90d86-bb0a-48b4-9e12-66028e70f8e2",
                "displayName": "Sylvie Dijkerman",
                "teamName": "Milo's boys",
                "totalPoints": 1502,
                "totalStagePoints": 1063,
                "totalTourPoints": 280,
                "totalMountainPoints": 43,
                "totalYouthPoints": 65,
                "totalPointsPoints": 51,
                "deltaTotalStagePoints": 456,
                "previousTotalPoints": 1046,
                "previousPosition": 39,
                "position": 39
            }, {
                "id": "3c0d463e-509f-4f51-ae80-ddee36b90f0b",
                "displayName": "Bart Besselink",
                "teamName": "tourkenner",
                "totalPoints": 1414,
                "totalStagePoints": 1059,
                "totalTourPoints": 151,
                "totalMountainPoints": 42,
                "totalYouthPoints": 198,
                "totalPointsPoints": -36,
                "deltaTotalStagePoints": 358,
                "previousTotalPoints": 1056,
                "previousPosition": 38,
                "position": 40
            }, {
                "id": "d51d0227-5a33-4fbd-bc7c-e7d3453c4019",
                "displayName": "Massimiliano Gaviano ",
                "teamName": "Lampre ",
                "totalPoints": 1396,
                "totalStagePoints": 1311,
                "totalTourPoints": 70,
                "totalMountainPoints": 104,
                "totalYouthPoints": -101,
                "totalPointsPoints": 12,
                "deltaTotalStagePoints": 189,
                "previousTotalPoints": 1207,
                "previousPosition": 33,
                "position": 41
            }, {
                "id": "fe15cd64-39c5-4203-ab4e-924d8579f0d6",
                "displayName": "Rietje Dijkerman",
                "teamName": "nogeendijkvaneenteam",
                "totalPoints": 1358,
                "totalStagePoints": 1010,
                "totalTourPoints": 264,
                "totalMountainPoints": -75,
                "totalYouthPoints": 95,
                "totalPointsPoints": 64,
                "deltaTotalStagePoints": 393,
                "previousTotalPoints": 965,
                "previousPosition": 41,
                "position": 42
            }, {
                "id": "56ba5a90-0f53-450e-b4a9-5060895316b3",
                "displayName": "Jan Dimmendaal",
                "teamName": "Lochem racing team ",
                "totalPoints": 1348,
                "totalStagePoints": 772,
                "totalTourPoints": 239,
                "totalMountainPoints": 253,
                "totalYouthPoints": 51,
                "totalPointsPoints": 33,
                "deltaTotalStagePoints": 542,
                "previousTotalPoints": 806,
                "previousPosition": 44,
                "position": 43
            }, {
                "id": "9e380d8f-6f75-425a-a97f-5f0ef7850b9e",
                "displayName": "Julius Reincke",
                "teamName": "Julius Reincke",
                "totalPoints": 1218,
                "totalStagePoints": 1031,
                "totalTourPoints": 26,
                "totalMountainPoints": -14,
                "totalYouthPoints": 159,
                "totalPointsPoints": 16,
                "deltaTotalStagePoints": 264,
                "previousTotalPoints": 954,
                "previousPosition": 42,
                "position": 44
            }]
        }
        else {
            return this.participantService.updateTable(id);
        }
    }

    @Get('/updateTable/:id')
    async setLastUpdateDate(@Param('id') id): Promise<void> {
        return this.participantService.invalidateCacheAndSetLastUpdated(id);

    }

    @UseInterceptors(CacheInterceptor)
    @Get('/table/:tourId/etappe/:etappeId')
    async getEtappe(@Param('tourId') tourId, @Param('etappeId') etappeId): Promise<Participant[]> {
        return this.participantService.getEtappe(tourId, etappeId);
    }

    @UseInterceptors(CacheInterceptor)
    @Get('/table/:tourId/latestetappe')
    async getLastEtappe(@Param('tourId') tourId): Promise<Participant[]> {
        return this.participantService.getLatestEtappe(tourId);
    }

    @Get('/rider/:tourriderId')
    async getTourRider(@Param('tourriderId') tourriderId): Promise<any> {
        return this.participantService.getTourRider(tourriderId);
    }

    @Post()
    async create(@Req() req, @Body() createParticipantDto: CreateParticipantDto) {
        this.logger.log('post participant');
        const newParticipant = Object.assign({}, createParticipantDto);
        return await this.participantService.create(newParticipant, req.user.email);
    }
}
