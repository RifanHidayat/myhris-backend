import {
  IsString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';

// DTO untuk attendance break submission
export class SubmitAttendanceBreakDto {
  @IsOptional()
  @IsString()
  date?: string; // Changed from tanggal_absen to date, optional

  @IsNumber()
  @IsNotEmpty()
  reg_type: number;

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

  // Break-specific fields
  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsString()
  end_date?: string;

  @IsOptional()
  @IsString()
  start_time?: string;

  @IsOptional()
  @IsString()
  end_time?: string;

  @IsOptional()
  @IsString()
  break_type?: string; // lunch, coffee, etc.

  @IsOptional()
  @IsString()
  break_duration?: string; // in minutes
}

// DTO untuk FormData attendance break submission
export class SubmitAttendanceBreakFormDataDto {
  @IsOptional()
  @IsString()
  date?: string; // Changed from tanggal_absen to date, optional

  @IsNumber()
  @IsNotEmpty()
  reg_type: number;

  @IsOptional()
  @IsString()
  type_attendance?: string;

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

  // Break-specific fields
  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsString()
  end_date?: string;

  @IsOptional()
  @IsString()
  start_time?: string;

  @IsOptional()
  @IsString()
  end_time?: string;

  @IsOptional()
  @IsString()
  break_type?: string; // lunch, coffee, etc.

  @IsOptional()
  @IsString()
  break_duration?: string; // in minutes

  // File upload akan ditangani oleh FileInterceptor
  // image?: Express.Multer.File;
} 