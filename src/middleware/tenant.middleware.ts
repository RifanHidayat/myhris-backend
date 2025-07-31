import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HeaderContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenant = req.query.tenant as string;
    const startPeriod = req.query.start_periode as string;
    const endPeriod = req.query.end_periode as string;

    if (!tenant) {
      throw new BadRequestException('Tenant tidak ditemukan');
    }

    req.tenant = tenant;
    req.startPeriod = startPeriod;
    req.endPeriod = endPeriod;

    next();
  }
}
