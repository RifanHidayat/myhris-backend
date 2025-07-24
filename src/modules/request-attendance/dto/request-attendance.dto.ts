import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';

/**
 * DTO untuk Permintaan Absensi
 */
export class RequestAttendanceDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsDateString()
  request_date: string;

  @IsNotEmpty()
  @IsString()
  request_type: string;

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class RequestAttendanceUpdateDto {
  @IsOptional()
  @IsDateString()
  request_date?: string;

  @IsOptional()
  @IsString()
  request_type?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
