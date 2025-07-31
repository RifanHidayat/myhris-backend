# Daily Tasks API Documentation

## 📋 Overview

API untuk mengelola tugas harian (daily tasks) dengan fitur CRUD lengkap, termasuk store, update, delete, dan berbagai endpoint untuk mengambil data.

## 🔐 Authentication

Semua endpoint memerlukan JWT authentication dengan header:
```
Authorization: Bearer <jwt_token>
```

## 📝 Required Headers

Semua endpoint memerlukan header berikut:
- `x-tenant-id`: ID tenant/database
- `x-em-id`: ID employee
- `start_periode`: Periode awal (YYYY-MM-DD)
- `end_periode`: Periode akhir (YYYY-MM-DD)

## 🚀 API Endpoints

### **1. GET /daily-tasks**
**Description:** Mengambil semua data tugas harian

**Headers:**
```
x-tenant-id: company
x-em-id: EMP001
start_periode: 2024-01-01
end_periode: 2024-01-31
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "em_id": "EMP001",
      "tgl_buat": "2024-01-15",
      "status_pengajuan": "pending",
      "created_at": "2024-01-15T08:00:00Z",
      "updated_at": "2024-01-15T08:00:00Z"
    }
  ]
}
```

### **2. GET /daily-tasks/list**
**Description:** Mengambil semua data tugas harian (alias untuk endpoint pertama)

**Headers:** Sama dengan endpoint pertama

**Response:** Sama dengan endpoint pertama

### **3. GET /daily-tasks/list-task**
**Description:** Mengambil list task (belum diimplementasikan)

**Headers:**
```
x-tenant-id: company
x-em-id: EMP001
start_periode: 2024-01-01
end_periode: 2024-01-31
```

**Response:**
```json
{
  "message": "List task endpoint - service method not implemented yet"
}
```

### **4. GET /daily-tasks/list-task-pdf**
**Description:** Mengambil list task untuk PDF (belum diimplementasikan)

**Headers:**
```
x-tenant-id: company
x-em-id: EMP001
start_periode: 2024-01-01
end_periode: 2024-01-31
```

**Response:**
```json
{
  "message": "List task PDF endpoint - service method not implemented yet"
}
```

### **5. GET /daily-tasks/:id**
**Description:** Mengambil data tugas harian berdasarkan ID

**Headers:**
```
x-tenant-id: company
x-em-id: EMP001
start_periode: 2024-01-01
end_periode: 2024-01-31
```

**Response:**
```json
{
  "message": "Get by ID endpoint - service method not implemented yet",
  "id": "1",
  "tenant": "company",
  "emId": "EMP001",
  "startPeriode": "2024-01-01",
  "endPeriode": "2024-01-31"
}
```

### **6. GET /daily-tasks/detail/:id**
**Description:** Mengambil detail tugas harian berdasarkan ID

**Headers:**
```
x-tenant-id: company
x-em-id: EMP001
start_periode: 2024-01-01
end_periode: 2024-01-31
```

**Response:**
```json
{
  "message": "Get detail by ID endpoint - service method not implemented yet",
  "id": "1",
  "tenant": "company",
  "emId": "EMP001",
  "startPeriode": "2024-01-01",
  "endPeriode": "2024-01-31"
}
```

### **7. POST /daily-tasks/store**
**Description:** Menyimpan tugas harian baru

**Headers:**
```
x-tenant-id: company
x-em-id: EMP001
start_periode: 2024-01-01
end_periode: 2024-01-31
```

**Body:**
```json
{
  "atten_date": "2024-01-15",
  "list_task": [
    {
      "task": "Menyelesaikan laporan bulanan",
      "judul": "Laporan Bulanan",
      "status": "pending",
      "level": 1,
      "tgl_finish": "2024-01-20"
    },
    {
      "task": "Meeting dengan tim",
      "judul": "Team Meeting",
      "status": "completed",
      "level": 2,
      "tgl_finish": "2024-01-15"
    }
  ],
  "status": "pending"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data Berhasil Ditambahkan"
}
```

### **8. PUT /daily-tasks/update/:id**
**Description:** Mengupdate tugas harian

**Headers:**
```
x-tenant-id: company
x-em-id: EMP001
start_periode: 2024-01-01
end_periode: 2024-01-31
```

**Body:**
```json
{
  "atten_date": "2024-01-15",
  "list_task": [
    {
      "task": "Menyelesaikan laporan bulanan",
      "judul": "Laporan Bulanan",
      "status": "completed",
      "level": 1,
      "tgl_finish": "2024-01-20",
      "id": 1
    }
  ],
  "status": "completed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data Berhasil Ditambahkan"
}
```

### **9. PUT /daily-tasks/update-draft/:id**
**Description:** Mengupdate draft tugas harian (belum diimplementasikan)

**Headers:**
```
x-tenant-id: company
x-em-id: EMP001
start_periode: 2024-01-01
end_periode: 2024-01-31
```

**Body:**
```json
{
  "atten_date": "2024-01-15",
  "list_task": [
    {
      "task": "Draft tugas",
      "judul": "Draft Judul",
      "status": "draft",
      "level": 1,
      "tgl_finish": "2024-01-20"
    }
  ],
  "status": "draft"
}
```

**Response:**
```json
{
  "message": "Update draft endpoint - service method not implemented yet",
  "id": "1",
  "tenant": "company",
  "emId": "EMP001",
  "startPeriode": "2024-01-01",
  "endPeriode": "2024-01-31"
}
```

### **10. DELETE /daily-tasks/delete/:id**
**Description:** Menghapus tugas harian

**Headers:**
```
x-tenant-id: company
x-em-id: EMP001
start_periode: 2024-01-01
end_periode: 2024-01-31
```

**Response:**
```json
{
  "success": true,
  "message": "Data berhasil dihapus"
}
```

## 📊 Database Schema

### **daily_task Table:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | INT | Primary key |
| `em_id` | VARCHAR | Employee ID |
| `tgl_buat` | DATE | Tanggal pembuatan |
| `status_pengajuan` | VARCHAR | Status pengajuan |
| `created_at` | TIMESTAMP | Waktu pembuatan |
| `updated_at` | TIMESTAMP | Waktu update |

### **daily_task_detail Table:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | INT | Primary key |
| `daily_task_id` | INT | Foreign key ke daily_task |
| `judul` | VARCHAR | Judul tugas |
| `rincian` | TEXT | Rincian tugas |
| `tgl_finish` | DATE | Tanggal selesai |
| `status` | VARCHAR | Status tugas |
| `level` | INT | Level prioritas |

## 🎯 Error Handling

### **Validation Errors:**
```json
{
  "statusCode": 400,
  "message": "x-tenant-id dan x-em-id harus disediakan",
  "error": "Bad Request"
}
```

### **Database Errors:**
```json
{
  "statusCode": 500,
  "message": "Gagal dapatkan data AllDailyTask: Connection failed",
  "error": "Internal Server Error"
}
```

### **Duplicate Data Error:**
```json
{
  "statusCode": 500,
  "message": "Tugas di tanggal 2024-01-15 ini sudah tersedia",
  "error": "Internal Server Error"
}
```

## 🔧 Implementation Status

### **✅ Implemented:**
- ✅ GET /daily-tasks (getAllDailyTask)
- ✅ GET /daily-tasks/list (getAllDailyTask)
- ✅ POST /daily-tasks/store (insertDailyTask)
- ✅ PUT /daily-tasks/update/:id (updateDailyTask)
- ✅ DELETE /daily-tasks/delete/:id (deleteDailyTask)

### **🔄 Partially Implemented:**
- 🔄 GET /daily-tasks/:id (placeholder)
- 🔄 GET /daily-tasks/detail/:id (placeholder)
- 🔄 GET /daily-tasks/list-task (placeholder)
- 🔄 GET /daily-tasks/list-task-pdf (placeholder)
- 🔄 PUT /daily-tasks/update-draft/:id (placeholder)

## 📝 Request Examples

### **cURL Examples:**

#### **1. Get All Daily Tasks:**
```bash
curl -X GET "http://localhost:3000/daily-tasks" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "x-tenant-id: company" \
  -H "x-em-id: EMP001" \
  -H "start_periode: 2024-01-01" \
  -H "end_periode: 2024-01-31"
```

#### **2. Store Daily Task:**
```bash
curl -X POST "http://localhost:3000/daily-tasks/store" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: company" \
  -H "x-em-id: EMP001" \
  -H "start_periode: 2024-01-01" \
  -H "end_periode: 2024-01-31" \
  -d '{
    "atten_date": "2024-01-15",
    "list_task": [
      {
        "task": "Menyelesaikan laporan bulanan",
        "judul": "Laporan Bulanan",
        "status": "pending",
        "level": 1,
        "tgl_finish": "2024-01-20"
      }
    ],
    "status": "pending"
  }'
```

#### **3. Update Daily Task:**
```bash
curl -X PUT "http://localhost:3000/daily-tasks/update/1" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: company" \
  -H "x-em-id: EMP001" \
  -H "start_periode: 2024-01-01" \
  -H "end_periode: 2024-01-31" \
  -d '{
    "atten_date": "2024-01-15",
    "list_task": [
      {
        "task": "Menyelesaikan laporan bulanan",
        "judul": "Laporan Bulanan",
        "status": "completed",
        "level": 1,
        "tgl_finish": "2024-01-20",
        "id": 1
      }
    ],
    "status": "completed"
  }'
```

#### **4. Delete Daily Task:**
```bash
curl -X DELETE "http://localhost:3000/daily-tasks/delete/1" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "x-tenant-id: company" \
  -H "x-em-id: EMP001" \
  -H "start_periode: 2024-01-01" \
  -H "end_periode: 2024-01-31"
```

## 🎯 Best Practices

### **1. Data Validation:**
- ✅ Validasi header yang diperlukan
- ✅ Validasi format tanggal
- ✅ Validasi status yang valid
- ✅ Validasi level prioritas

### **2. Error Handling:**
- ✅ Try-catch untuk database operations
- ✅ Rollback transaction jika error
- ✅ Proper error messages
- ✅ HTTP status codes yang sesuai

### **3. Security:**
- ✅ JWT authentication
- ✅ Tenant isolation
- ✅ Employee authorization
- ✅ Input sanitization

### **4. Performance:**
- ✅ Database transactions
- ✅ Proper indexing
- ✅ Connection pooling
- ✅ Query optimization

## 📈 Monitoring

### **Logs yang Dicatat:**
- ✅ Daily task creation
- ✅ Daily task updates
- ✅ Daily task deletions
- ✅ Database errors
- ✅ Validation errors

### **Metrics yang Dimonitor:**
- Jumlah daily tasks per employee
- Average completion time
- Task status distribution
- Error rates
- Response times

## 🔮 Future Enhancements

### **Planned Features:**
- [ ] Task templates
- [ ] Task categories
- [ ] Task priorities
- [ ] Task dependencies
- [ ] Task notifications
- [ ] Task analytics
- [ ] Task reporting
- [ ] Task approval workflow
- [ ] Task comments
- [ ] Task attachments 