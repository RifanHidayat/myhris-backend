import 'express';

declare module 'express' {
  export interface Request {
    tenant?: string;
    startPeriod?: string;
    endPeriod?: string;
  }
}
