import { IsString, IsOptional } from 'class-validator';

export class GlobalParamsDto {
  @IsString()
  @IsOptional()
  tenant?: string;

  @IsString()
  @IsOptional()
  em_id?: string;

  @IsString()
  @IsOptional()
  branch_id?: string;

  @IsString()
  @IsOptional()
  start_periode?: string;

  @IsString()
  @IsOptional()
  end_periode?: string;

  @IsString()
  @IsOptional()
  database?: string;

  @IsString()
  @IsOptional()
  approver?: string;

  @IsString()
  @IsOptional()
  nomor_ajuan?: string;
}

/**
 * Global Query Parameters DTO
 * Digunakan untuk query parameters yang sering digunakan
 * Semua parameter bersifat optional untuk fleksibilitas
 */
export class GlobalQueryParamsDto {
  @IsString()
  @IsOptional()
  tenant?: string;

  @IsString()
  @IsOptional()
  em_id?: string;

  @IsString()
  @IsOptional()
  start_periode?: string;

  @IsString()
  @IsOptional()
  end_periode?: string;

  @IsString()
  @IsOptional()
  branch_id?: string;
}

/**
 * Activities Query Parameters DTO
 * DTO khusus untuk endpoint activities dengan parameter wajib
 */
export class ActivitiesQueryParamsDto {
  @IsString()
  tenant: string;

  @IsString()
  em_id: string;

  @IsString()
  @IsOptional()
  start_periode?: string;

  @IsString()
  @IsOptional()
  end_periode?: string;
}

/**
 * Log Activity Query Parameters DTO
 * DTO khusus untuk endpoint log activity search
 */
export class LogActivityQueryParamsDto {
  @IsString()
  tenant: string;

  @IsString()
  @IsOptional()
  start_periode?: string;

  @IsString()
  @IsOptional()
  end_periode?: string;
}

/**
 * Info Activity DTO - untuk service info_aktifitas_employee
 */
export class InfoActivityDto {
  @IsString()
  tenant: string;

  @IsString()
  em_id: string;

  @IsString()
  @IsOptional()
  start_periode?: string;

  @IsString()
  @IsOptional()
  end_periode?: string;
}

/**
 * Log Activity Search DTO - untuk service pencarian_aktifitas
 */
export class LogActivitySearchDto {
  @IsString()
  database: string;

  @IsString()
  em_id: string;

  @IsString()
  cari: string;

  @IsString()
  @IsOptional()
  start_periode?: string;

  @IsString()
  @IsOptional()
  end_periode?: string;
}

/**
 * Contoh penggunaan DTO Global:
 * 
 * 1. Menggunakan GlobalQueryParamsDto untuk parameter optional:
 * @Get('example')
 * async example(@Query() query: GlobalQueryParamsDto) {
 *   // query.tenant, query.em_id, dll bisa undefined
 *   if (query.tenant) {
 *     // gunakan query.tenant
 *   }
 * }
 * 
 * 2. Menggunakan DTO spesifik untuk parameter wajib:
 * @Get('activities')
 * async activities(@Query() query: ActivitiesQueryParamsDto) {
 *   // query.tenant dan query.em_id sudah terjamin ada
 *   return this.service.getData(query.tenant, query.em_id);
 * }
 * 
 * 3. URL contoh:
 * GET /activities/info-activity?tenant=company1&em_id=123&start_periode=2024-01&end_periode=2024-12
 * POST /activities/log-activity-search?tenant=company1&start_periode=2024-01&end_periode=2024-12
 */ 