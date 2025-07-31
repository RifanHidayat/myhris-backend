# Submit Attendance Service Documentation

## Overview

`SubmitAttendanceService` adalah service utama untuk menangani submission attendance (absen) dalam sistem MyHRIS. Service ini mendukung upload gambar, deteksi keterlambatan, perhitungan lembur, dan pembuatan surat peringatan otomatis.

## Table of Contents

1. [Interfaces](#interfaces)
2. [Class Methods](#class-methods)
3. [Usage Examples](#usage-examples)
4. [Error Handling](#error-handling)
5. [Database Schema](#database-schema)
6. [Configuration](#configuration)

## Interfaces

### FileUpload Interface

```typescript
interface FileUpload {
  fieldname: string;      // Nama field dari FormData
  originalname: string;   // Nama file asli
  encoding: string;       // Encoding file
  mimetype: string;       // MIME type file
  size: number;          // Ukuran file dalam bytes
  buffer: Buffer;        // Buffer file
  destination?: string;   // Destination path (optional)
  filename?: string;      // Generated filename (optional)
  path?: string;         // File path (optional)
}
```

### AttendanceFormDataDto Interface

```typescript
interface AttendanceFormDataDto {
  database: string;           // Nama database tenant
  em_id: string;             // Employee ID
  tanggal_absen: string;     // Tanggal absen (YYYY-MM-DD)
  reg_type: number;          // Registration type (0 = no image, 1 = with image)
  type_attendance?: string;  // Attendance type (1 = check-in, 2 = check-out)
  location?: string;         // Location string
  note?: string;            // Attendance note
  lat_lang?: string;        // Latitude and longitude
  place?: string;           // Place name
  category?: string;        // Attendance category
  image?: FileUpload;       // Uploaded file from FormData
}
```

## Class Methods

### 1. submitAttendance()

**Method utama untuk submit attendance.**

```typescript
async submitAttendance(dto: AttendanceFormDataDto): Promise<any>
```

**Parameters:**
- `dto: AttendanceFormDataDto` - Data attendance dengan file upload

**Returns:**
```typescript
{
  status: boolean;
  message: string;
  title: string;
  is_show_notif: boolean;
  deskription: string;
  status_absen: string;
  data: {
    // Attendance data
    em_id: string;
    atten_date: string;
    signin_time: string;
    signout_time: string;
    place_in: string;
    place_out: string;
    signin_longlat: string;
    signout_longlat: string;
    signin_pict: string;
    signout_pict: string;
    signin_note: string;
    signout_note: string;
    signin_addr: string;
    signout_addr: string;
    atttype: number;
    reg_type: number;
    // File upload info
    image_uploaded: boolean;
    image_path: string | null;
    original_filename: string | null;
    file_size: number | null;
  }
}
```

**Features:**
- ✅ Upload gambar ke FTP server
- ✅ Deteksi keterlambatan otomatis
- ✅ Perhitungan lembur otomatis
- ✅ Pembuatan surat peringatan
- ✅ Validasi jadwal kerja
- ✅ Support multi-tenant database

### 2. handleLateAttendance()

**Method private untuk menangani keterlambatan.**

```typescript
private async handleLateAttendance(
  trx: any, 
  namaDatabaseDynamic: string, 
  namaDatabasMaster: string, 
  em_id: string, 
  tanggalAbsen: string, 
  jamMasuk: string, 
  jamMasukJadwal: string
): Promise<void>
```

**Logic:**
1. Hitung jumlah keterlambatan
2. Ambil setting sistem untuk maksimal keterlambatan
3. Generate surat peringatan jika melebihi batas

### 3. handleOvertimeLogic()

**Method private untuk menangani lembur.**

```typescript
private async handleOvertimeLogic(
  trx: any, 
  namaDatabaseDynamic: string, 
  namaDatabasMaster: string, 
  em_id: string, 
  tanggalAbsen: string, 
  jamKeluar: string, 
  lokasiAbsenOut: string
): Promise<void>
```

**Logic:**
1. Cek jadwal kerja untuk jam keluar
2. Hitung durasi lembur
3. Generate record lembur otomatis

### 4. handleEarlyLeaveLogic()

**Method private untuk menangani pulang cepat.**

```typescript
private async handleEarlyLeaveLogic(
  trx: any, 
  namaDatabaseDynamic: string, 
  namaDatabasMaster: string, 
  em_id: string, 
  tanggalAbsen: string, 
  jamKeluar: string
): Promise<void>
```

**Logic:**
1. Cek jadwal kerja untuk jam keluar
2. Hitung jumlah pulang cepat
3. Generate surat peringatan jika melebihi batas

### 5. generateWarningLetter()

**Method private untuk generate surat peringatan.**

```typescript
private async generateWarningLetter(
  trx: any, 
  namaDatabasMaster: string, 
  em_id: string, 
  title: string, 
  count: number
): Promise<void>
```

**Features:**
- Generate nomor surat otomatis (SP2024010001)
- Insert ke tabel employee_letter
- Set status pending untuk approval

### 6. generateOvertimeRecord()

**Method private untuk generate record lembur.**

```typescript
private async generateOvertimeRecord(
  trx: any, 
  namaDatabaseDynamic: string, 
  em_id: string, 
  tanggalAbsen: string, 
  jamMulai: string, 
  jamSelesai: string, 
  lokasi: string
): Promise<void>
```

**Features:**
- Generate nomor lembur otomatis (LB2024010001)
- Hitung durasi lembur dalam menit
- Insert ke tabel emp_labor

### 7. getAttendanceById()

**Method untuk mengambil data attendance berdasarkan ID.**

```typescript
async getAttendanceById(id: string, database: string): Promise<any>
```

**Returns:**
```typescript
{
  status: boolean;
  message: string;
  data: AttendanceData;
}
```

### 8. updateAttendanceById()

**Method untuk update data attendance berdasarkan ID.**

```typescript
async updateAttendanceById(id: string, dto: any, database: string): Promise<any>
```

**Updateable Fields:**
- signin_time
- signout_time
- place_in
- place_out
- signin_longlat
- signout_longlat
- signin_pict
- signout_pict
- signin_note
- signout_note
- signin_addr
- signout_addr

### 9. deleteAttendanceById()

**Method untuk delete data attendance berdasarkan ID.**

```typescript
async deleteAttendanceById(id: string, database: string): Promise<any>
```

**Returns:**
```typescript
{
  status: boolean;
  message: string;
  data: { id: string; deleted_count: number };
}
```

## Usage Examples

### 1. Submit Attendance dengan Gambar

```typescript
// Controller usage
@Post('submit')
@UseInterceptors(FileInterceptor('image'))
async submitAttendance(
  @Query('tenant') tenant: string,
  @Query('em_id') emId: string,
  @Body() dto: SubmitAttendanceFormDataDto,
  @UploadedFile() image?: any,
): Promise<any> {
  const attendanceDto = {
    database: tenant,
    em_id: emId,
    tanggal_absen: dto.tanggal_absen || getDateNow(),
    reg_type: dto.reg_type || 1,
    type_attendance: dto.type_attendance,
    location: dto.location,
    note: dto.note,
    lat_lang: dto.lat_lang,
    place: dto.place,
    category: dto.category,
    image,
  };
  
  return this.submitAttendanceService.submitAttendance(attendanceDto);
}
```

### 2. Client Request Example

```bash
curl -X POST "http://localhost:3000/attendances/submit?tenant=company&em_id=EMP001" \
  -H "Authorization: Bearer <token>" \
  -F "image=@photo.png" \
  -F "reg_type=1" \
  -F "type_attendance=1" \
  -F "location=Office Building" \
  -F "note=Check in for work" \
  -F "lat_lang=-6.2088,106.8456" \
  -F "place=Main Office"
```

### 3. Response Example

```json
{
  "status": true,
  "message": "berhasil kirim absen",
  "title": "",
  "is_show_notif": false,
  "deskription": "",
  "status_absen": "",
  "data": {
    "em_id": "EMP001",
    "atten_date": "2024-01-15",
    "signin_time": "08:00:00",
    "signout_time": "00:00:00",
    "place_in": "Main Office",
    "place_out": "",
    "signin_longlat": "-6.2088,106.8456",
    "signout_longlat": "",
    "signin_pict": "abc123150120240800.png",
    "signout_pict": "",
    "signin_note": "Check in for work",
    "signout_note": "",
    "signin_addr": "Office Building",
    "signout_addr": "",
    "atttype": 0,
    "reg_type": 1,
    "image_uploaded": true,
    "image_path": "/foto_absen/company/abc123150120240800.png",
    "original_filename": "photo.png",
    "file_size": 1024000
  }
}
```

## Error Handling

### 1. Missing Required Parameters

```typescript
if (!database || !em_id || !start_date || !end_date || !start_time || !end_time) {
  throw new InternalServerErrorException('Missing required parameters');
}
```

### 2. File Upload Error

```typescript
try {
  // Upload logic
} catch (error) {
  console.error('❌ Error uploading image to FTP:', error);
  nameFile = ''; // Continue without image
}
```

### 3. Database Transaction Error

```typescript
try {
  // Database operations
  await trx.commit();
} catch (error) {
  await trx.rollback();
  console.error('❌ Error in submitAttendance:', error);
  throw new InternalServerErrorException('Gagal kirim absen', error.message);
}
```

## Database Schema

### Attendance Table

```sql
CREATE TABLE attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  em_id VARCHAR(50) NOT NULL,
  atten_date DATE NOT NULL,
  signin_time TIME DEFAULT '00:00:00',
  signout_time TIME DEFAULT '00:00:00',
  working_hour VARCHAR(50),
  place_in VARCHAR(255),
  place_out VARCHAR(255),
  absence VARCHAR(50),
  overtime VARCHAR(50),
  earnleave VARCHAR(50),
  status VARCHAR(50),
  signin_longlat VARCHAR(100),
  signout_longlat VARCHAR(100),
  signin_pict VARCHAR(255),
  signout_pict VARCHAR(255),
  signin_note TEXT,
  signout_note TEXT,
  signin_addr VARCHAR(255),
  signout_addr VARCHAR(255),
  atttype INT DEFAULT 0,
  reg_type INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Employee Letter Table

```sql
CREATE TABLE employee_letter (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nomor VARCHAR(50) NOT NULL,
  tgl_surat DATE NOT NULL,
  em_id VARCHAR(50) NOT NULL,
  letter_id VARCHAR(50) NOT NULL,
  eff_date DATE NOT NULL,
  exp_date DATE,
  upload_file VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Pending',
  approve_status VARCHAR(50) DEFAULT 'Pending',
  title VARCHAR(255),
  alasan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Emp Labor Table (Overtime)

```sql
CREATE TABLE emp_labor (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nomor_ajuan VARCHAR(50) NOT NULL,
  em_id VARCHAR(50) NOT NULL,
  branch_id VARCHAR(50),
  typeid INT DEFAULT 1,
  dari_jam TIME,
  sampai_jam TIME,
  atten_date DATE,
  alasan TEXT,
  status VARCHAR(50) DEFAULT 'Pending',
  approve_status VARCHAR(50) DEFAULT 'Pending',
  durasi INT,
  lokasi VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Configuration

### 1. FTP Configuration

Service menggunakan `SftpService` untuk upload gambar:

```typescript
// config/sftp.service.ts
@Injectable()
export class SftpService {
  async connect(): Promise<void>
  async uploadFile(localPath: string, remotePath: string): Promise<void>
  async disconnect(): Promise<void>
}
```

### 2. Database Configuration

Service menggunakan `DbService` untuk koneksi database:

```typescript
// config/database.service.ts
@Injectable()
export class DbService {
  getConnection(database: string): Knex
}
```

### 3. System Settings

Service menggunakan tabel `sysdata` untuk konfigurasi:

```sql
-- Late attendance settings
SELECT * FROM sysdata WHERE kode IN ('S01', '020', '029', 'S08', 'S09');

-- Overtime settings  
SELECT * FROM sysdata WHERE kode IN ('041', '042');

-- Early leave settings
SELECT * FROM sysdata WHERE kode IN ('S02', '030', '020', 'S10', 'S11');
```

## Dependencies

```typescript
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';
import { SftpService } from '../../../config/sftp.service';
import { FcmService } from '../../../common/fcm.service';
import randomstring from 'randomstring';
import { formatDbNameNow, getDateNow } from 'src/common/utils';
import * as fs from 'fs';
import * as path from 'path';
```

## Best Practices

1. **Transaction Management**: Selalu gunakan transaction untuk operasi database
2. **Error Handling**: Tangani error dengan proper logging dan rollback
3. **File Upload**: Validasi file sebelum upload ke FTP
4. **Data Validation**: Validasi input data sebelum proses
5. **Logging**: Gunakan console.log untuk debugging
6. **Type Safety**: Gunakan TypeScript interfaces untuk type safety

## Troubleshooting

### Common Issues

1. **File Upload Failed**
   - Cek koneksi FTP server
   - Validasi file size dan format
   - Cek permission folder upload

2. **Database Connection Error**
   - Cek konfigurasi database
   - Validasi nama database tenant
   - Cek koneksi network

3. **Late Detection Not Working**
   - Cek data jadwal kerja di tabel emp_shift
   - Validasi setting sysdata untuk keterlambatan
   - Cek format waktu di database

4. **Overtime Not Generated**
   - Cek setting overtime di sysdata
   - Validasi jam kerja di work_schedule
   - Cek permission untuk insert emp_labor

## Version History

- **v1.0.0**: Initial implementation with basic attendance submission
- **v1.1.0**: Added FormData support and file upload
- **v1.2.0**: Added late detection and warning letter generation
- **v1.3.0**: Added overtime calculation and early leave detection
- **v1.4.0**: Improved error handling and logging 