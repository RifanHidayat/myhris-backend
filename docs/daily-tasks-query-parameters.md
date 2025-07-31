# Daily Tasks Controller - Query Parameters Update

## 📋 Overview

`DailyTasksController` telah diupdate untuk menggunakan `@Query` parameters seperti di `AttendanceController`, menggantikan penggunaan `@Headers` untuk konsistensi dengan pattern yang ada.

## 🔄 Changes Made

### **Before (Using Headers):**
```typescript
@Get('')
async getAll(
  @Headers('x-tenant-id') tenant: string,
  @Headers('x-em-id') emId: string,
  @Headers('start_periode') startPeriode: string,
  @Headers('end_periode') endPeriode: string,
  @Req() req: any
): Promise<any> {
  if (!tenant || !emId) {
    throw new BadRequestException('x-tenant-id dan x-em-id harus disediakan');
  }
  // ... rest of implementation
}
```

### **After (Using Query Parameters):**
```typescript
@Get('')
async getAll(
  @Query('tenant') tenant: string,
  @Query('em_id') emId: string,
  @Query('start_periode') startPeriode: string,
  @Query('end_periode') endPeriode: string,
  @Req() req: any
): Promise<any> {
  if (!tenant || !emId) {
    throw new BadRequestException('tenant dan em_id harus disediakan');
  }
  // ... rest of implementation
}
```

## 📝 Updated Endpoints

### **1. GET Endpoints:**

#### **GET /daily-tasks**
```typescript
@Get('')
async getAll(
  @Query('tenant') tenant: string,
  @Query('em_id') emId: string,
  @Query('start_periode') startPeriode: string,
  @Query('end_periode') endPeriode: string,
  @Req() req: any
): Promise<any>
```

#### **GET /daily-tasks/list**
```typescript
@Get('list')
async getAllData(
  @Query('tenant') tenant: string,
  @Query('em_id') emId: string,
  @Query('start_periode') startPeriode: string,
  @Query('end_periode') endPeriode: string,
  @Req() req: any
): Promise<any>
```

#### **GET /daily-tasks/list-task**
```typescript
@Get('list-task')
async getListTask(
  @Query('tenant') tenant: string,
  @Query('em_id') emId: string,
  @Query('start_periode') startPeriode: string,
  @Query('end_periode') endPeriode: string,
  @Req() req: any
): Promise<any>
```

#### **GET /daily-tasks/list-task-pdf**
```typescript
@Get('list-task-pdf')
async getListTaskPdf(
  @Query('tenant') tenant: string,
  @Query('em_id') emId: string,
  @Query('start_periode') startPeriode: string,
  @Query('end_periode') endPeriode: string,
  @Req() req: any
): Promise<any>
```

#### **GET /daily-tasks/:id**
```typescript
@Get(':id')
async getById(
  @Param('id') id: string,
  @Query('tenant') tenant: string,
  @Query('em_id') emId: string,
  @Query('start_periode') startPeriode: string,
  @Query('end_periode') endPeriode: string,
  @Req() req: any
): Promise<any>
```

#### **GET /daily-tasks/detail/:id**
```typescript
@Get('detail/:id')
async getByIdDetail(
  @Param('id') id: string,
  @Query('tenant') tenant: string,
  @Query('em_id') emId: string,
  @Query('start_periode') startPeriode: string,
  @Query('end_periode') endPeriode: string,
  @Req() req: any
): Promise<any>
```

### **2. POST Endpoints:**

#### **POST /daily-tasks/store**
```typescript
@Post('store')
async store(
  @Query('tenant') tenant: string,
  @Query('em_id') emId: string,
  @Query('start_periode') startPeriode: string,
  @Query('end_periode') endPeriode: string,
  @Req() req: any,
  @Body() body: any
): Promise<any>
```

### **3. PUT Endpoints:**

#### **PUT /daily-tasks/update/:id**
```typescript
@Put('update/:id')
async update(
  @Param('id') id: string,
  @Query('tenant') tenant: string,
  @Query('em_id') emId: string,
  @Query('start_periode') startPeriode: string,
  @Query('end_periode') endPeriode: string,
  @Req() req: any,
  @Body() body: any
): Promise<any>
```

#### **PUT /daily-tasks/update-draft/:id**
```typescript
@Put('update-draft/:id')
async updateDraft(
  @Param('id') id: string,
  @Query('tenant') tenant: string,
  @Query('em_id') emId: string,
  @Query('start_periode') startPeriode: string,
  @Query('end_periode') endPeriode: string,
  @Req() req: any,
  @Body() body: any
): Promise<any>
```

### **4. DELETE Endpoints:**

#### **DELETE /daily-tasks/delete/:id**
```typescript
@Delete('delete/:id')
async delete(
  @Param('id') id: string,
  @Query('tenant') tenant: string,
  @Query('em_id') emId: string,
  @Query('start_periode') startPeriode: string,
  @Query('end_periode') endPeriode: string,
  @Req() req: any
): Promise<any>
```

## 🎯 Benefits of Query Parameters

### **1. Consistency:**
- ✅ **Same pattern** dengan AttendanceController
- ✅ **Uniform API design** across modules
- ✅ **Easier maintenance** dengan pattern yang konsisten

### **2. Flexibility:**
- ✅ **URL-based parameters** lebih mudah untuk testing
- ✅ **Browser-friendly** untuk debugging
- ✅ **Cache-friendly** untuk query parameters

### **3. Standard REST:**
- ✅ **RESTful design** dengan query parameters
- ✅ **HTTP standards** compliance
- ✅ **Better documentation** dengan URL examples

## 📝 Request Examples

### **cURL Examples:**

#### **1. Get All Daily Tasks:**
```bash
curl -X GET "http://localhost:3000/daily-tasks?tenant=company&em_id=EMP001&start_periode=2024-01-01&end_periode=2024-01-31" \
  -H "Authorization: Bearer <jwt_token>"
```

#### **2. Get Daily Task by ID:**
```bash
curl -X GET "http://localhost:3000/daily-tasks/1?tenant=company&em_id=EMP001&start_periode=2024-01-01&end_periode=2024-01-31" \
  -H "Authorization: Bearer <jwt_token>"
```

#### **3. Store Daily Task:**
```bash
curl -X POST "http://localhost:3000/daily-tasks/store?tenant=company&em_id=EMP001&start_periode=2024-01-01&end_periode=2024-01-31" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
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

#### **4. Update Daily Task:**
```bash
curl -X PUT "http://localhost:3000/daily-tasks/update/1?tenant=company&em_id=EMP001&start_periode=2024-01-01&end_periode=2024-01-31" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
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

#### **5. Delete Daily Task:**
```bash
curl -X DELETE "http://localhost:3000/daily-tasks/delete/1?tenant=company&em_id=EMP001&start_periode=2024-01-01&end_periode=2024-01-31" \
  -H "Authorization: Bearer <jwt_token>"
```

## 🔧 Error Handling

### **Validation Errors:**
```json
{
  "statusCode": 400,
  "message": "tenant dan em_id harus disediakan",
  "error": "Bad Request"
}
```

### **Missing Parameters:**
```json
{
  "statusCode": 400,
  "message": "tenant, em_id, dan id harus disediakan",
  "error": "Bad Request"
}
```

## 📊 Comparison with Attendance Controller

### **Similar Pattern:**
```typescript
// Attendance Controller
@Get('')
async getAll(
  @Query('tenant') tenant: string,
  @Query('em_id') emId: string,
  @Query('branch_id') branchId: string,
  @Query('start_periode') startPeriode: string,
  @Query('end_periode') endPeriode: string,
  @Req() req: any
): Promise<any>

// Daily Tasks Controller
@Get('')
async getAll(
  @Query('tenant') tenant: string,
  @Query('em_id') emId: string,
  @Query('start_periode') startPeriode: string,
  @Query('end_periode') endPeriode: string,
  @Req() req: any
): Promise<any>
```

### **Consistent Validation:**
```typescript
// Both controllers use same validation pattern
if (!tenant || !emId) {
  throw new BadRequestException('tenant dan em_id harus disediakan');
}
```

## 🎯 Migration Guide

### **For Client Applications:**

#### **Old Way (Headers):**
```javascript
const headers = {
  'Authorization': 'Bearer <jwt_token>',
  'x-tenant-id': 'company',
  'x-em-id': 'EMP001',
  'start_periode': '2024-01-01',
  'end_periode': '2024-01-31'
};

fetch('http://localhost:3000/daily-tasks', { headers });
```

#### **New Way (Query Parameters):**
```javascript
const url = 'http://localhost:3000/daily-tasks?tenant=company&em_id=EMP001&start_periode=2024-01-01&end_periode=2024-01-31';
const headers = {
  'Authorization': 'Bearer <jwt_token>'
};

fetch(url, { headers });
```

## 📈 Benefits

### **1. API Consistency:**
- ✅ **Same pattern** across all controllers
- ✅ **Easier to learn** dan implement
- ✅ **Better documentation** dengan URL examples

### **2. Developer Experience:**
- ✅ **Browser-friendly** untuk testing
- ✅ **URL-based debugging** lebih mudah
- ✅ **Cache-friendly** untuk query parameters

### **3. REST Standards:**
- ✅ **RESTful design** dengan query parameters
- ✅ **HTTP standards** compliance
- ✅ **Better SEO** untuk public APIs

## ✅ Update Complete

Daily Tasks Controller telah berhasil diupdate untuk menggunakan query parameters seperti Attendance Controller, memberikan konsistensi dan fleksibilitas yang lebih baik! 🎉 