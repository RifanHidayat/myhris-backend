import { IsString } from 'class-validator';

export class GlobalParamsDto {
  @IsString()
  database: string;

  @IsString()
  emId: string;

  @IsString()
  branchId: string;
  @IsString()
  startPeriode: string;

  @IsString()
  endPeriode: string;
} 