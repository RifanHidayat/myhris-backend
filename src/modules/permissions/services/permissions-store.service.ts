import { Injectable, InternalServerErrorException } from '@nestjs/common';

interface PermissionsStoreDto {
  database: string;
  leave_type: string;
  em_id: string;
  typeid: string;
  nomor_ajuan: string;
  start_date: string;
  end_date: string;
  leave_duration: number;
  date_selected: string;
  time_plan: string;
  time_plan_to: string;
  apply_date: string;
  reason: string;
  leave_status: string;
  em_delegation: string;
  leave_files: string;
  ajuan: string;
  lokasi: string;
  multiselect?: string;
  created_by: string;
  menu_name: string;
  activity_name: string;
  total_cuti: number;
  cut_leave: number;
}

@Injectable()
export class PermissionsStoreService {
  async store(dto: PermissionsStoreDto): Promise<any> {
    // Catatan: Logic sangat panjang, refactor lanjutan bisa dilakukan untuk modularisasi.
    try {
      // Implementasi utama: simpan data izin ke database
      // (Contoh: gunakan Knex atau ORM sesuai standar project Anda)
      // Untuk sekarang, return dummy response
      return {
        status: true,
        message: 'Berhasil simpan data izin (dummy)',
        data: dto,
      };
    } catch (e) {
      throw new InternalServerErrorException('Gagal simpan data izin');
    }
  }
}
