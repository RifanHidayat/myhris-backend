import {
  IsString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';

// DTO untuk regular attendance submission (check-in/check-out)
export class SubmitAttendanceDto {
  @IsString()
  @IsNotEmpty()
  date: string;

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
}

// DTO untuk FormData attendance submission (check-in/check-out)
export class SubmitAttendanceFormDataDto {
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

  // File upload akan ditangani oleh FileInterceptor
  // image?: Express.Multer.File;
}
