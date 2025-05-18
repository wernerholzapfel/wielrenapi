import { Injectable, Logger } from '@nestjs/common';
import { Connection, Repository } from "typeorm";
import * as admin from "firebase-admin";
import { Pushtoken } from "../pushtoken/pushtoken.entity";
import { Participant } from "../participant/participant.entity";
import { InjectRepository } from '@nestjs/typeorm';
import { response } from 'express';
import { parseJsonText } from 'typescript';
import { Tour } from '../tour/tour.entity';

@Injectable()
export class NotificationService {

    constructor(@InjectRepository(Pushtoken)
    private readonly pushTokenRepo: Repository<Pushtoken>,
        @InjectRepository(Participant)
        private readonly participantRepo: Repository<Participant>,
        private readonly connection: Connection) {
    }
    private readonly logger = new Logger('NotificationService', true);

    async sendNotification(): Promise<admin.messaging.MessagingDevicesResponse[]> {

        const tour = await this.connection.getRepository(Tour)
            .createQueryBuilder('tour')
            .where('tour.isActive')
            .getOne();

        if (tour) {
            const db = admin.database();
            const ref = db.ref(tour.id);

            const lastUpdated = ref.child('lastUpdated');
            lastUpdated.set({ tour: tour.id, lastUpdated: Date.now() });
        }

        const pushtokens: Pushtoken[] = await this.pushTokenRepo
            .createQueryBuilder('pushtoken')
            .leftJoin('pushtoken.participant', 'participant')
            .select(['participant.id', 'participant.displayName', 'pushtoken.pushToken'])
            .where('pushtoken.isDeleted = false')
            .getMany();

        pushtokens.forEach(async (token) => {
            await admin.messaging().send({
                notification: {
                    title: 'Het Wielerspel',
                    body: `Hoi ${token.participant.displayName}, de stand is bijgewerkt.`,
                },  
                token: token.pushToken,
                apns: {
                    payload: {
                        aps: {
                            badge: 1
                        }
                    }
                }
            })
                .then((response) => {
                    console.log('Succesvol verzonden:', response);
                })
                .catch((error) => {
                    console.error('Fout bij verzenden:', error);

                    const invalidTokens = [
                        'messaging/invalid-argument',
                        'messaging/registration-token-not-registered',
                        'messaging/invalid-registration-token'
                    ];

                    if (invalidTokens.includes(error.code)) {
                        console.log(`Token ongeldig of verwijderd: ${token.pushToken}`);
                        this.cleanupToken(token.pushToken)
                    }
                })
                .finally(async () => {
                });
        })
        return [];
    }

    // Cleans up the tokens that are no longer valid.
    async cleanupToken(pushToken: string) {
        this.pushTokenRepo
            .createQueryBuilder()
            .update(Pushtoken)
            .set({ isDeleted: true })
            .where("pushToken = :pushToken", { pushToken: pushToken })
            .execute();
    }
}

