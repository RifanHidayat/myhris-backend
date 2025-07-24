import { IsString } from 'class-validator';

export class GlobalReportParamsDto {
  @IsString()
  database: string;

  @IsString()
  emId: string;

  @IsString()
  branchId: string;

  @IsString()
  status: string;

  @IsString()
  type: string;

  @IsString()
  statusAjuan: string;

  @IsString()
  tahun: string;

  @IsString()
  bulan: string;

  @IsString()
  startPeriode: string;

  @IsString()
  endPeriode: string;
} 