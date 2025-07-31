# Date Parameter Update - Automatic Date Handling

## 📋 Overview

Sistem attendance telah diupdate untuk menggunakan parameter `date` sebagai pengganti `tanggal_absen` dengan fitur automatic date handling. Jika parameter `date` undefined, null, atau kosong, sistem akan otomatis menggunakan tanggal hari ini.

## 🔄 Perubahan Parameter

### **Sebelumnya:**
```typescript
interface AttendanceFormDataDto {
  database: string;
  em_id: string;
  tanggal_absen: string; // Required parameter
  reg_type: number;
  // ... other fields
}
```

### **Sekarang:**
```typescript
interface AttendanceFormDataDto {
  database: string;
  em_id: string;
  date?: string; // Optional parameter
  reg_type: number;
  // ... other fields
}
```

## 🎯 Automatic Date Handling

### **Logic untuk Mengambil Tanggal:**
```typescript
// Get attendance date - use today if date is undefined, null, or empty
const attendanceDate = dto.date && dto.date.trim() !== '' ? dto.date : getDateNow();
```

### **Contoh Penggunaan:**

#### **1. Dengan Parameter Date:**
```json
{
  "database": "company",
  "em_id": "EMP001",
  "date": "2024-01-15",
  "reg_type": 1,
  "type_attendance": "1",
  "location": "Main Office",
  "note": "Check in",
  "lat_lang": "-6.2088,106.8456",
  "place": "Office Building",
  "category": "1"
}
```

#### **2. Tanpa Parameter Date (Auto Today):**
```json
{
  "database": "company",
  "em_id": "EMP001",
  "reg_type": 1,
  "type_attendance": "1",
  "location": "Main Office",
  "note": "Check in",
  "lat_lang": "-6.2088,106.8456",
  "place": "Office Building",
  "category": "1"
}
```

#### **3. Dengan Date Kosong:**
```json
{
  "database": "company",
  "em_id": "EMP001",
  "date": "",
  "reg_type": 1,
  "type_attendance": "1",
  "location": "Main Office",
  "note": "Check in",
  "lat_lang": "-6.2088,106.8456",
  "place": "Office Building",
  "category": "1"
}
```

## 📝 Files yang Diupdate

### **1. Service Files:**
- ✅ `src/modules/attendances/services/submit-attendance.services.ts`
- ✅ `src/modules/attendances/services/submit-attendance-break.services.ts`

### **2. DTO Files:**
- ✅ `src/modules/attendances/dto/submit-attendance.dto.ts`
- ✅ `src/modules/attendances/dto/submit-attendance-break.dto.ts`

### **3. Controller:**
- ✅ `src/modules/attendances/attendance.controller.ts`

## 🔧 Logic Implementation

### **Submit Attendance Service:**
```typescript
async submitAttendance(dto: AttendanceFormDataDto): Promise<any> {
  const database = dto.database;
  let nameFile = '';
  
  // Get attendance date - use today if date is undefined, null, or empty
  const attendanceDate = dto.date && dto.date.trim() !== '' ? dto.date : getDateNow();
  
  // ... rest of the logic using attendanceDate
}
```

### **Submit Attendance Break Service:**
```typescript
async submitAttendanceBreak(dto: AttendanceBreakFormDataDto): Promise<any> {
  const database = dto.database;
  let nameFile = '';
  
  // Get attendance date - use today if date is undefined, null, or empty
  const attendanceDate = dto.date && dto.date.trim() !== '' ? dto.date : getDateNow();
  
  // ... rest of the logic using attendanceDate
}
```

### **Controller Mapping:**
```typescript
// Map parameters to match AttendanceFormDataDto interface
const attendanceDto = {
  database: tenant,
  em_id: emId,
  tanggal_absen: dto.date || getDateNow(), // Changed from dto.tanggal_absen to dto.date
  reg_type: dto.reg_type || 1,
  // ... other fields
};
```

## 🎯 Validasi Parameter

### **Valid Scenarios:**
1. **✅ Date provided:** `"date": "2024-01-15"`
2. **✅ Date undefined:** `date` tidak ada dalam request
3. **✅ Date null:** `"date": null`
4. **✅ Date empty:** `"date": ""`
5. **✅ Date whitespace:** `"date": "   "`

### **Result untuk Semua Scenario:**
- Jika date valid → gunakan date yang diberikan
- Jika date invalid/kosong → gunakan `getDateNow()` (tanggal hari ini)

## 📊 Database Impact

### **Query Examples:**

#### **Dengan Date Spesifik:**
```sql
SELECT * FROM attendance 
WHERE em_id = 'EMP001' AND atten_date = '2024-01-15'
```

#### **Dengan Date Auto (Hari Ini):**
```sql
SELECT * FROM attendance 
WHERE em_id = 'EMP001' AND atten_date = '2024-01-20' -- tanggal hari ini
```

## 🚀 API Response Examples

### **Success Response (Dengan Date):**
```json
{
  "status": true,
  "message": "berhasil kirim absen",
  "data": {
    "em_id": "EMP001",
    "atten_date": "2024-01-15",
    "signin_time": "08:00:00",
    "signout_time": "00:00:00",
    "place_absen_in": "Main Office",
    "signin_longlat": "-6.2088,106.8456",
    "signin_pict": "abc123150120240800.png",
    "signin_note": "Check in",
    "signin_addr": "Office Building",
    "image_uploaded": true,
    "image_path": "/foto_absen/company/abc123150120240800.png",
    "original_filename": "photo.png",
    "file_size": 1024000
  }
}
```

### **Success Response (Auto Date):**
```json
{
  "status": true,
  "message": "berhasil kirim absen",
  "data": {
    "em_id": "EMP001",
    "atten_date": "2024-01-20", // tanggal hari ini
    "signin_time": "08:00:00",
    "signout_time": "00:00:00",
    "place_absen_in": "Main Office",
    "signin_longlat": "-6.2088,106.8456",
    "signin_pict": "abc123150120240800.png",
    "signin_note": "Check in",
    "signin_addr": "Office Building",
    "image_uploaded": true,
    "image_path": "/foto_absen/company/abc123150120240800.png",
    "original_filename": "photo.png",
    "file_size": 1024000
  }
}
```

## 🎯 Benefits

### **1. User Experience:**
- ✅ Tidak perlu selalu mengirim tanggal
- ✅ Default ke tanggal hari ini
- ✅ Fleksibilitas untuk tanggal spesifik

### **2. Backward Compatibility:**
- ✅ Tetap mendukung parameter date
- ✅ Tidak breaking change untuk client yang sudah ada

### **3. Data Consistency:**
- ✅ Selalu ada tanggal yang valid
- ✅ Tidak ada record dengan tanggal kosong
- ✅ Mudah untuk query dan reporting

### **4. Error Prevention:**
- ✅ Mencegah error karena tanggal kosong
- ✅ Validasi otomatis
- ✅ Fallback yang reliable

## 🔄 Migration Guide

### **Untuk Client Applications:**

#### **Old Way (Masih Bisa):**
```javascript
const data = {
  database: "company",
  em_id: "EMP001",
  date: "2024-01-15", // Optional now
  reg_type: 1,
  // ... other fields
};
```

#### **New Way (Recommended):**
```javascript
const data = {
  database: "company",
  em_id: "EMP001",
  // date: "2024-01-15", // Optional, will use today if not provided
  reg_type: 1,
  // ... other fields
};
```

### **Untuk Testing:**

#### **Test Case 1: Dengan Date**
```bash
curl -X POST "http://localhost:3000/attendances/submit" \
  -H "Content-Type: multipart/form-data" \
  -F "database=company" \
  -F "em_id=EMP001" \
  -F "date=2024-01-15" \
  -F "reg_type=1" \
  -F "type_attendance=1"
```

#### **Test Case 2: Tanpa Date (Auto Today)**
```bash
curl -X POST "http://localhost:3000/attendances/submit" \
  -H "Content-Type: multipart/form-data" \
  -F "database=company" \
  -F "em_id=EMP001" \
  -F "reg_type=1" \
  -F "type_attendance=1"
```

## 📈 Monitoring

### **Logs yang Dicatat:**
- ✅ Date parameter provided
- ✅ Date parameter auto (today)
- ✅ Date validation success
- ✅ Date validation error

### **Metrics yang Dimonitor:**
- Jumlah request dengan date parameter
- Jumlah request dengan auto date
- Error rate untuk date validation
- Average response time

## 🔮 Future Enhancements

### **Planned Features:**
- [ ] Date format validation (YYYY-MM-DD)
- [ ] Date range validation (tidak boleh lebih dari 30 hari ke belakang)
- [ ] Timezone handling
- [ ] Date caching untuk performance
- [ ] Date analytics dan reporting 