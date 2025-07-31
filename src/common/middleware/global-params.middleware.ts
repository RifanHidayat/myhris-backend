import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class GlobalParamsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Prioritas: body > header > query
    req['globalParams'] = {
      database: req.body.database || req.headers['x-tanant'] || req.query.database,
      emId: req.body.emId || req.headers['x-em-id'] || req.query.emId,
      branchId: req.body.branchId || req.headers['x-branch-id'] || req.query.branchId,
    
      startPeriode: req.body.startPeriode || req.headers['x-start-periode'] || req.query.startPeriode,
      endPeriode: req.body.endPeriode || req.headers['x-end-periode'] || req.query.endPeriode,
      
    };
    next();
  }
} 