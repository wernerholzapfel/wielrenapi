import {ForbiddenException, Injectable, Logger, NestMiddleware, UnauthorizedException} from '@nestjs/common';
import 'dotenv/config';
import * as admin from 'firebase-admin';

@Injectable()
export class AddFireBaseUserToRequest implements NestMiddleware {
    private readonly logger = new Logger('AddFireBaseUserToRequest', true);

    use(req, res, next) {
        const extractedToken = getToken(req.headers);
        if (extractedToken) {
            admin.auth().verifyIdToken(extractedToken)
                .then(decodedToken => {
                    let uid = decodedToken.uid;
                    this.logger.log('uid: ' + uid);
                    admin.auth().getUser(uid)
                        .then(userRecord => {
                            // See the UserRecord reference doc for the contents of userRecord.
                            req.user = userRecord;
                            next();
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

@Injectable()
export class AdminMiddleware implements NestMiddleware {
    private readonly logger = new Logger('AdminMiddleware', true);

        use (req, res, next)  {
            const extractedToken = getToken(req.headers);
            if (extractedToken) {
                admin.auth().verifyIdToken(extractedToken).then((claims) => {
                    this.logger.log(claims);
                    if (claims.admin === true) {
                        this.logger.log('ik ben admin');
                        next();
                    }
                    else {
                        next(new ForbiddenException('Om wijzigingen door te kunnen voeren moet je admin zijn'));
                    }
                });
            } else {
                next(new UnauthorizedException('We konden je niet verifieren, log opnieuw in.'));
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
