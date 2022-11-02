import {Injectable, Logger, NestMiddleware} from '@nestjs/common';
import { json } from 'body-parser'

@Injectable()
export class JsonBodyMiddleware implements NestMiddleware {
  private readonly logger = new Logger('JsonBodyMiddleware', true);

  use(req: Request, res: Response, next: () => any) {
    this.logger.log('JsonBodyMiddleware henkie')

    json()(req as any, res as any, next)
  }
}
