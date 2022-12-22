import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import * as admin from 'firebase-admin';
import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';

admin.initializeApp({
    credential: admin.credential.cert({
            // @ts-ignore
            // type: process.env.type,
            project_id: process.env.project_id,
            private_key_id: process.env.private_key_id,
            // private_key: process.env.private_key,
            private_key:  JSON.parse(process.env.private_key),
            client_email: process.env.client_email,
            client_id: process.env.client_id,
            auth_uri: 'https://accounts.google.com/o/oauth2/auth',
            token_uri: 'https://accounts.google.com/o/oauth2/token',
            auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
            client_x509_cert_url: process.env.client_x509_cert_url
        }
    ),
    databaseURL: process.env.firebaseDatabaseUrl,
});

let allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Pragma, Expires, Cache-Control, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.sendStatus(200);
    }
    else {
        next();
    }
};

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
        /**
         * Reference: https://docs.nestjs.com/techniques/validation#auto-validation
         */
        new ValidationPipe({
            // Make sure that there's no unexpected data
            whitelist: true,
            forbidNonWhitelisted: false,
            forbidUnknownValues: true,

            /**
             * Detailed error messages since this is 4xx
             */
            disableErrorMessages: false,

            validationError: {
                /**
                 * WARNING: Avoid exposing the values in the error output (could leak sensitive information)
                 */
                value: false,
            },

            /**
             * Transform the JSON into a class instance when possible.
             * Depends on the type of the data on the controllers
             */
            transform: true,
        }),
    );
    app.use(allowCrossDomain);

    await app.listen(process.env.PORT || 3000)

    ;
}

bootstrap();
