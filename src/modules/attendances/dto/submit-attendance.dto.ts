import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsNotEmpty,
  IsDefined,
} from 'class-validator';

export class SubmitAttendanceDto {
  @IsString()
  @IsNotEmpty()
  database: string;

  @IsString()
  @IsNotEmpty()
  em_id: string;

  @IsString()
  @IsNotEmpty()
  tanggal_absen: string;

  @IsNumber()
  @IsNotEmpty()
  reg_type: number;

  @IsOptional()
  @IsString()
  gambar?: string;

  @IsOptional()
  @IsString()
  lokasi?: string;

  @IsOptional()
  @IsString()
  catatan?: string;

  @IsOptional()
  @IsString()
  latLang?: string;

  @IsOptional()
  @IsString()
  place?: string;

  @IsOptional()
  @IsString()
  kategori?: string;

  @IsOptional()
  @IsString()
  typeAbsen?: string;

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

  // Tambahkan field lain sesuai kebutuhan dari body request
}
