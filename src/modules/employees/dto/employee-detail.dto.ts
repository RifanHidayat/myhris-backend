import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';

export class EmployeeDetailDto {
  @IsString()
  @IsNotEmpty()
  tenant: string;

  @IsString()
  @IsNotEmpty()
  emId: string;

  @IsString()
  @IsNotEmpty()
  startPeriode: string;

  @IsString()
  @IsNotEmpty()
  endPeriode: string;
}

export class LastAttendanceRequestDto {
  @IsOptional()
  @IsString()
  start_time?: string;

  @IsOptional()
  @IsString()
  end_time?: string;

  @IsOptional()
  @IsNumber()
  reg_type?: number;

  @IsOptional()
  @IsString()
  pola?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  lat_lang?: string;

  @IsOptional()
  @IsString()
  place?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  type_attendance?: string;
}
