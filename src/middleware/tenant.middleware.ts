import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HeaderContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenant = req.headers['x-tenant-id'] as string;
    const startPeriod = req.headers['x-start-period'] as string;
    const endPeriod = req.headers['x-end-period'] as string;

    if (!tenant) {
      throw new BadRequestException('Tenant header tidak ditemukan');
    }

    req.tenant = tenant;
    req.startPeriod = startPeriod;
    req.endPeriod = endPeriod;

    next();
  }
}
