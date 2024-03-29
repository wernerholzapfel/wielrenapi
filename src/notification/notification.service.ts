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
            await admin.messaging().sendToDevice(token.pushToken, {
                notification: {
                    title: 'Het Wielerspel',
                    body: `Hoi ${token.participant.displayName}, de stand is bijgewerkt.`,
                    badge: '1'
                }
            }, {})
                .then(async (response) => {
                    this.cleanupToken({ ...response, token })
                })
                .catch(async (error) => console.log(error))
                .finally(async () => {
                });
        })
        return [];
    }

    // Cleans up the tokens that are no longer valid.
    async cleanupToken(response) {
        return await response.results.forEach((result) => {
            const error = result.error;
            if (error) {
                console.error('Failure sending notification to', response.token.participant.displayName);
                // Cleanup the tokens who are not registered anymore.
                if (error.code === 'messaging/invalid-registration-token' ||
                    error.code === 'messaging/registration-token-not-registered') {
                    console.log('delete this token: ' + response.token.pushToken)
                    this.pushTokenRepo
                        .createQueryBuilder()
                        .update(Pushtoken)
                        .set({ isDeleted: true })
                        .where("pushToken = :pushToken", { pushToken: response.token.pushToken })
                        .execute();
                }
            }
        })
    }
}

