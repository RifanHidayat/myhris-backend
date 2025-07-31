# Common Utils Functions Documentation

## 📋 Overview

File `src/common/utils.ts` berisi utility functions yang dapat digunakan di seluruh aplikasi MyHRIS.

## 🕐 Time & Date Functions

### 1. getTimeNow()

**Description:** Mendapatkan waktu sekarang dalam format HH:mm:ss

**Returns:** `string` - Waktu sekarang dalam format HH:mm:ss

**Example:**
```typescript
import { getTimeNow } from 'src/common/utils';

const currentTime = getTimeNow(); // "08:30:45"
```

**Use Cases:**
- Attendance check-in/check-out time
- Break time recording
- Time-based calculations
- Logging with timestamp

### 2. getDateNow()

**Description:** Mendapatkan tanggal sekarang dalam format YYYY-MM-DD

**Returns:** `string` - Tanggal sekarang dalam format YYYY-MM-DD

**Example:**
```typescript
import { getDateNow } from 'src/common/utils';

const currentDate = getDateNow(); // "2024-01-15"
```

**Use Cases:**
- Attendance date recording
- Report generation
- Date-based filtering
- Database queries

### 3. getDateTimeNow()

**Description:** Mendapatkan tanggal dan waktu sekarang dalam format YYYY-MM-DD HH:mm:ss

**Returns:** `string` - Tanggal dan waktu sekarang dalam format YYYY-MM-DD HH:mm:ss

**Example:**
```typescript
import { getDateTimeNow } from 'src/common/utils';

const currentDateTime = getDateTimeNow(); // "2024-01-15 08:30:45"
```

**Use Cases:**
- Timestamp logging
- Audit trails
- Database timestamps
- API responses

## 🗄️ Database Functions

### 1. formatDbName(date, db)

**Description:** Format nama database berdasarkan tanggal dan nama database

**Parameters:**
- `date: string` - Tanggal dalam format YYYY-MM-DD
- `db: string` - Nama database

**Returns:** `string` - Nama database yang diformat

**Example:**
```typescript
import { formatDbName } from 'src/common/utils';

const dbName = formatDbName('2024-01-15', 'company'); // "company_hrm2401"
```

### 2. formatDbNameNow(db)

**Description:** Format nama database berdasarkan tanggal sekarang

**Parameters:**
- `db: string` - Nama database

**Returns:** `string` - Nama database yang diformat dengan tanggal sekarang

**Example:**
```typescript
import { formatDbNameNow } from 'src/common/utils';

const dbName = formatDbNameNow('company'); // "company_hrm2401"
```

### 3. databaseMaster(db)

**Description:** Mendapatkan nama database master

**Parameters:**
- `db: string` - Nama database

**Returns:** `string` - Nama database master

**Example:**
```typescript
import { databaseMaster } from 'src/common/utils';

const masterDb = databaseMaster('company'); // "company_hrm"
```

## 📊 Calculation Functions

### 1. convertDaysToYMD(totalDays)

**Description:** Konversi total hari menjadi tahun, bulan, hari

**Parameters:**
- `totalDays: number` - Total hari

**Returns:** `object` - Object dengan properti tahun, bulan, hari

**Example:**
```typescript
import { convertDaysToYMD } from 'src/common/utils';

const result = convertDaysToYMD(400); // { tahun: 1, bulan: 1, hari: 5 }
```

## 🔐 Security Functions

### 1. decryptText(textToDecrypt, key)

**Description:** Decrypt text yang dienkripsi

**Parameters:**
- `textToDecrypt: string` - Text yang akan didecrypt
- `key: string` - Key untuk decrypt

**Returns:** `string` - Text yang sudah didecrypt

**Example:**
```typescript
import { decryptText } from 'src/common/utils';

const decryptedText = decryptText(encryptedText, secretKey);
```

## 🎯 Usage Examples

### Attendance Service

```typescript
import { getTimeNow, getDateNow, formatDbNameNow } from 'src/common/utils';

export class SubmitAttendanceService {
  async submitAttendance(dto: AttendanceFormDataDto): Promise<any> {
    // Get current time for attendance
    const currentTime = getTimeNow(); // "08:30:45"
    const currentDate = getDateNow(); // "2024-01-15"
    
    // Format database name
    const dbName = formatDbNameNow(dto.database);
    
    // Use in attendance logic
    const attendanceData = {
      em_id: dto.em_id,
      atten_date: currentDate,
      signin_time: currentTime,
      // ... other fields
    };
  }
}
```

### Break Service

```typescript
import { getTimeNow, getDateNow } from 'src/common/utils';

export class SubmitAttendanceBreakService {
  async submitAttendanceBreak(dto: AttendanceBreakFormDataDto): Promise<any> {
    // Get current time for break
    const breakTime = getTimeNow(); // "12:00:00"
    const breakDate = getDateNow(); // "2024-01-15"
    
    // Use in break logic
    const breakData = {
      em_id: dto.em_id,
      atten_date: breakDate,
      breakin_time: breakTime,
      // ... other fields
    };
  }
}
```

### Logging Service

```typescript
import { getDateTimeNow } from 'src/common/utils';

export class LoggingService {
  logActivity(activity: string): void {
    const timestamp = getDateTimeNow(); // "2024-01-15 08:30:45"
    
    console.log(`[${timestamp}] ${activity}`);
  }
}
```

## 📝 Best Practices

### 1. Time Consistency
- Gunakan `getTimeNow()` untuk waktu attendance
- Gunakan `getDateNow()` untuk tanggal attendance
- Gunakan `getDateTimeNow()` untuk logging dan audit

### 2. Database Naming
- Gunakan `formatDbNameNow()` untuk database dinamis
- Gunakan `databaseMaster()` untuk database master
- Konsisten dalam penggunaan di seluruh aplikasi

### 3. Error Handling
- Selalu handle error saat menggunakan utility functions
- Validasi input sebelum menggunakan functions
- Log error dengan timestamp yang tepat

### 4. Performance
- Cache hasil function jika digunakan berulang
- Hindari pemanggilan function yang tidak perlu
- Gunakan function yang tepat untuk kebutuhan

## 🔄 Migration Guide

### Dari getDateNow() ke getTimeNow()

**Sebelum:**
```typescript
// Menggunakan getDateNow() untuk waktu (salah)
let formattedTime = getDateNow(); // "2024-01-15"
```

**Sesudah:**
```typescript
// Menggunakan getTimeNow() untuk waktu (benar)
let formattedTime = getTimeNow(); // "08:30:45"
```

### Dari Manual Time Calculation

**Sebelum:**
```typescript
const now = new Date();
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');
const seconds = String(now.getSeconds()).padStart(2, '0');
let formattedTime = `${hours}:${minutes}:${seconds}`;
```

**Sesudah:**
```typescript
import { getTimeNow } from 'src/common/utils';
let formattedTime = getTimeNow();
```

## 📊 Function Comparison

| Function | Format | Use Case | Example |
|----------|--------|----------|---------|
| `getTimeNow()` | HH:mm:ss | Attendance time | "08:30:45" |
| `getDateNow()` | YYYY-MM-DD | Attendance date | "2024-01-15" |
| `getDateTimeNow()` | YYYY-MM-DD HH:mm:ss | Logging/Audit | "2024-01-15 08:30:45" |

## 🎯 Summary

Utility functions ini memberikan konsistensi dalam penanganan waktu dan tanggal di seluruh aplikasi MyHRIS. Penggunaan yang tepat akan memastikan:

- ✅ **Konsistensi format** waktu dan tanggal
- ✅ **Reusability** di seluruh aplikasi
- ✅ **Maintainability** yang lebih baik
- ✅ **Type safety** dengan TypeScript
- ✅ **Performance** yang optimal 