import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HeaderContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenant = req.headers['x-tenant-id'] as string;
    const startPeriod = req.headers['x-start-period'] as string;
    const endPeriod = req.headers['x-end-period'] as string;

    if (!tenant) {
      return res.status(400).json({ message: 'Tenant header tidak ditemukan' });
    }

    // Simpan ke request object
    (req as any).tenant = tenant;
    (req as any).startPeriod = startPeriod;
    (req as any).endPeriod = endPeriod;

    next();
  }
}
