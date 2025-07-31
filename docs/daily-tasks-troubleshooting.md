# Daily Tasks Troubleshooting Guide

## 🐛 **Problem: "date tidak ditemukan"**

### **Error Description:**
```
console.log('dto', date, em_id); // date is undefined
```

## 🔍 **Root Cause Analysis:**

### **1. Controller to Service Mapping Issue:**
Controller mengirim data dengan nama yang berbeda dari yang diharapkan service.

#### **Controller (Before Fix):**
```typescript
const dtoWithHeaders = {
  ...req.globalParams, 
  ...body, 
  tenant, 
  emId, // ❌ camelCase
  startPeriode, 
  endPeriode 
};
```

#### **Service Expectation:**
```typescript
const { date, list_tasks, status, tenant, em_id } = dto; // ✅ snake_case
```

### **2. Property Name Mismatch:**
- Controller: `emId` (camelCase)
- Service: `em_id` (snake_case)
- DTO: `list_tasks` vs `list_task`

## ✅ **Fixes Applied:**

### **1. Controller Mapping Fix:**

#### **Before:**
```typescript
const dtoWithHeaders = {
  ...req.globalParams, 
  ...body, 
  tenant, 
  emId, // ❌ Wrong mapping
  startPeriode, 
  endPeriode 
};
```

#### **After:**
```typescript
const dtoWithHeaders = {
  ...req.globalParams, 
  ...body, 
  tenant, 
  em_id: emId, // ✅ Correct mapping
  startPeriode, 
  endPeriode 
};
```

### **2. Service Property Names:**

#### **DTO Interface:**
```typescript
export interface DailyTasksStoreDto {
  em_id: string; // ✅ snake_case
  date: string;
  list_tasks: Array<{ // ✅ Correct property name
    task: string;
    title: string;
    status: string;
    level: number;
    finish_date: string;
  }>;
  status: string;
  tenant: string;
  start_periode?: string;
  end_periode?: string;
}
```

#### **Service Destructuring:**
```typescript
const { date, list_tasks, status, tenant, em_id } = dto; // ✅ Match DTO
```

### **3. Null Safety:**
```typescript
// Added null check for list_tasks
if (list_tasks && list_tasks.length > 0) {
  // Process tasks
}
```

## 📊 **Data Flow:**

### **1. Request Flow:**
```
Client Request
    ↓
Controller (@Post('store'))
    ↓
Query Parameters: tenant, em_id, start_periode, end_periode
    ↓
Body: { date, list_tasks, status, ... }
    ↓
Mapping: emId → em_id
    ↓
Service: insertDailyTask(dto)
    ↓
Database: INSERT INTO daily_task
```

### **2. Expected Request Format:**
```json
POST /daily-tasks/store?tenant=company&em_id=EMP001&start_periode=2024-01-01&end_periode=2024-01-31
Content-Type: application/json

{
  "date": "2024-01-15",
  "list_tasks": [
    {
      "task": "Menyelesaikan laporan bulanan",
      "title": "Laporan Bulanan", 
      "status": "pending",
      "level": 1,
      "finish_date": "2024-01-20"
    }
  ],
  "status": "pending"
}
```

## 🔧 **Debugging Steps:**

### **1. Check Controller Mapping:**
```typescript
// In controller, before service call
console.log('dtoWithHeaders:', dtoWithHeaders);
```

### **2. Check Service DTO:**
```typescript
// In service, at method start
console.log('dto:', dto);
console.log('destructured:', { date, list_tasks, status, tenant, em_id });
```

### **3. Check Database Query:**
```typescript
// Before database query
console.log('query params:', [date, em_id]);
```

## 🎯 **Common Issues & Solutions:**

### **1. Undefined Properties:**
```typescript
// ❌ Problem
const { date, em_id } = dto; // date is undefined

// ✅ Solution
const dtoWithHeaders = {
  ...body,
  em_id: emId, // Map from query parameter
  date: body.date // Ensure date from body
};
```

### **2. Property Name Mismatch:**
```typescript
// ❌ Problem
list_task vs list_tasks

// ✅ Solution
// Use consistent naming: list_tasks
```

### **3. Null Safety:**
```typescript
// ❌ Problem
list_tasks.length > 0 // Error if list_tasks is null

// ✅ Solution
list_tasks && list_tasks.length > 0
```

## 📝 **Testing Checklist:**

### **1. Controller Level:**
- ✅ Query parameters: `tenant`, `em_id`, `start_periode`, `end_periode`
- ✅ Body mapping: `emId` → `em_id`
- ✅ All required properties mapped correctly

### **2. Service Level:**
- ✅ DTO interface matches expected properties
- ✅ Destructuring gets all required values
- ✅ Database queries use correct column names

### **3. Database Level:**
- ✅ Table schema matches query expectations
- ✅ Column names: `em_id`, `tgl_buat`, `status_pengajuan`
- ✅ Data types match expected values

## ✅ **Fix Complete:**

Mapping issues telah diperbaiki dan data flow sekarang konsisten dari controller ke service ke database! 🎉 