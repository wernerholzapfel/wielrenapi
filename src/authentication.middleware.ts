import {Injectable, Logger, NestMiddleware} from '@nestjs/common';
import 'dotenv/config';
import * as admin from 'firebase-admin';

@Injectable()
export class AddFireBaseUserToRequest implements NestMiddleware {
    private readonly logger = new Logger('AddFireBaseUserToRequest', true);

    use(req, res, next) {
        this.logger.log('werner1');
        const extractedToken = getToken(req.headers);
        if (extractedToken) {
            admin.auth().verifyIdToken(extractedToken)
                .then(decodedToken => {
                    let uid = decodedToken.uid;
                    this.logger.log('uid: ' + uid);
                    admin.auth().getUser(uid)
                        .then(userRecord => {
                            // See the UserRecord reference doc for the contents of userRecord.
                            console.log('Successfully fetched user data:', userRecord.toJSON());
                            req.user = userRecord;
                            next()
                        })
                        .catch(error => {
                            console.log('Error fetching user data:', error);
                        });
                }).catch(error => {
                console.log('Error verify token:', error);
            });
        }
    };

}


const getToken = headers => {
    if (headers && headers.authorization) {
        const parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};