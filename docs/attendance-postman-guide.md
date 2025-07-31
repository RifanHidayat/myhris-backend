# Attendance API - Postman Collection Guide

## 📋 Overview

Dokumentasi ini menjelaskan cara menggunakan Postman Collection untuk API Attendance MyHRIS. Collection ini mencakup semua endpoint attendance dengan support FormData untuk upload gambar.

## 🚀 Quick Start

### 1. Import Collection

1. Buka Postman
2. Klik **Import** button
3. Upload file `attendance-postman-collection.json`
4. Collection akan muncul di sidebar

### 2. Setup Environment Variables

Sebelum menggunakan collection, setup environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `base_url` | `http://localhost:3000` | Base URL API |
| `tenant` | `company` | Nama tenant/database |
| `em_id` | `EMP001` | Employee ID |
| `branch_id` | `BR001` | Branch ID |
| `start_periode` | `2024-01-01` | Start periode |
| `end_periode` | `2024-01-31` | End periode |
| `auth_token` | `your_jwt_token_here` | JWT Token |

### 3. Authentication Setup

1. Klik **Authorization** tab di request
2. Pilih **Bearer Token**
3. Masukkan token: `{{auth_token}}`

## 📝 Endpoints Overview

### GET Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/attendances` | GET | Get all attendances |
| `/attendances/place-coordinates` | GET | Get place coordinates |
| `/attendances/:id` | GET | Get attendance by ID |

### POST Endpoints (FormData)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/attendances/submit` | POST | Submit attendance (check-in/out) |
| `/attendances/submit-break` | POST | Submit attendance break |

### PUT/DELETE Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/attendances/:id` | PUT | Update attendance |
| `/attendances/:id` | DELETE | Delete attendance |

## 🔧 Detailed Usage

### 1. Get All Attendances

**Endpoint:** `GET /attendances`

**Query Parameters:**
- `tenant` (required): Nama tenant/database
- `em_id` (required): Employee ID
- `branch_id` (optional): Branch ID
- `start_periode` (optional): Start periode (YYYY-MM-DD)
- `end_periode` (optional): End periode (YYYY-MM-DD)

**Headers:**
```
Authorization: Bearer {{auth_token}}
Content-Type: application/json
Accept: application/json
```

**Example Request:**
```
GET {{base_url}}/attendances?tenant={{tenant}}&em_id={{em_id}}&branch_id={{branch_id}}&start_periode={{start_periode}}&end_periode={{end_periode}}
```

**Success Response:**
```json
{
  "status": true,
  "message": "Success get attendance list",
  "data": [
    {
      "id": 1,
      "em_id": "EMP001",
      "atten_date": "2024-01-15",
      "signin_time": "08:00:00",
      "signout_time": "17:00:00",
      "place_in": "Main Office",
      "place_out": "Main Office",
      "signin_longlat": "-6.2088,106.8456",
      "signout_longlat": "-6.2088,106.8456",
      "signin_pict": "abc123150120240800.png",
      "signout_pict": "abc123150120241700.png",
      "signin_note": "Check in for work",
      "signout_note": "Check out from work",
      "signin_addr": "Office Building",
      "signout_addr": "Office Building",
      "atttype": 0,
      "reg_type": 1
    }
  ]
}
```

### 2. Submit Attendance (Check-in)

**Endpoint:** `POST /attendances/submit`

**Query Parameters:**
- `tenant` (required): Nama tenant/database
- `em_id` (required): Employee ID
- `start_periode` (optional): Start periode
- `end_periode` (optional): End periode

**FormData Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reg_type` | text | Yes | 0 = no image, 1 = with image |
| `type_attendance` | text | Yes | 1 = check-in, 2 = check-out |
| `location` | text | No | Location string |
| `note` | text | No | Attendance note |
| `lat_lang` | text | No | GPS coordinates |
| `place` | text | No | Place name |
| `category` | text | No | Attendance category |
| `image` | file | No | Upload image file |

**Headers:**
```
Authorization: Bearer {{auth_token}}
Accept: application/json
```

**Example FormData:**
```
reg_type: 1
type_attendance: 1
location: Office Building
note: Check in for work
lat_lang: -6.2088,106.8456
place: Main Office
category: 0
image: [Select File]
```

**Success Response:**
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

### 3. Submit Attendance (Check-out)

**Endpoint:** `POST /attendances/submit`

**FormData Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reg_type` | text | Yes | 0 = no image, 1 = with image |
| `type_attendance` | text | Yes | 1 = check-in, 2 = check-out |
| `location` | text | No | Location string |
| `note` | text | No | Attendance note |
| `lat_lang` | text | No | GPS coordinates |
| `place` | text | No | Place name |
| `category` | text | No | Attendance category |
| `image` | file | No | Upload image file |

**Example FormData:**
```
reg_type: 1
type_attendance: 2
location: Office Building
note: Check out from work
lat_lang: -6.2088,106.8456
place: Main Office
category: 0
image: [Select File]
```

### 4. Submit Attendance Break

**Endpoint:** `POST /attendances/submit-break`

**FormData Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tanggal_absen` | text | Yes | Tanggal absen (YYYY-MM-DD) |
| `reg_type` | text | Yes | 0 = no image, 1 = with image |
| `type_attendance` | text | Yes | 1 = check-in, 2 = check-out |
| `location` | text | No | Location string |
| `note` | text | No | Break note |
| `lat_lang` | text | No | GPS coordinates |
| `place` | text | No | Place name |
| `category` | text | No | Attendance category |
| `image` | file | No | Upload image file |

**Example FormData:**
```
tanggal_absen: 2024-01-15
reg_type: 1
type_attendance: 1
location: Office Building
note: Break time
lat_lang: -6.2088,106.8456
place: Main Office
category: 0
image: [Select File]
```

### 5. Get Attendance by ID

**Endpoint:** `GET /attendances/:id`

**Query Parameters:**
- `tenant` (required): Nama tenant/database

**Example Request:**
```
GET {{base_url}}/attendances/1?tenant={{tenant}}
```

### 6. Update Attendance by ID

**Endpoint:** `PUT /attendances/:id`

**Query Parameters:**
- `tenant` (required): Nama tenant/database

**Body (JSON):**
```json
{
  "signin_time": "08:30:00",
  "signout_time": "17:30:00",
  "place_in": "Updated Office",
  "place_out": "Updated Office",
  "signin_longlat": "-6.2088,106.8456",
  "signout_longlat": "-6.2088,106.8456",
  "signin_pict": "updated_image.png",
  "signout_pict": "updated_image.png",
  "signin_note": "Updated check in note",
  "signout_note": "Updated check out note",
  "signin_addr": "Updated Office Building",
  "signout_addr": "Updated Office Building"
}
```

### 7. Delete Attendance by ID

**Endpoint:** `DELETE /attendances/:id`

**Query Parameters:**
- `tenant` (required): Nama tenant/database

**Example Request:**
```
DELETE {{base_url}}/attendances/1?tenant={{tenant}}
```

## 📁 File Upload Guidelines

### Supported File Types
- PNG
- JPG
- JPEG

### File Size Limits
- Maximum: 5MB
- Recommended: 1-2MB

### Image Requirements
- Clear and readable
- Good lighting
- Face visible (if required)
- Location context visible

### Upload Process
1. Klik **Select Files** di field `image`
2. Pilih file gambar dari komputer
3. Pastikan file size tidak terlalu besar
4. Submit request

## 🔐 Authentication

### JWT Token Setup

1. **Get Token:**
   ```
   POST {{base_url}}/auth/login
   Content-Type: application/json
   
   {
     "username": "your_username",
     "password": "your_password"
   }
   ```

2. **Set Token Variable:**
   - Copy token dari response
   - Set variable `auth_token` dengan token
   - Token akan otomatis digunakan di semua request

### Token Refresh

Jika token expired:
1. Login ulang untuk mendapatkan token baru
2. Update variable `auth_token`
3. Retry request

## ⚠️ Error Handling

### Common Errors

| Error Code | Message | Solution |
|------------|---------|----------|
| 400 | `tenant dan em_id harus disediakan` | Add required parameters |
| 401 | `Unauthorized` | Check JWT token |
| 500 | `Gagal kirim absen` | Check server logs |

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "tenant dan em_id harus disediakan",
  "error": "Bad Request"
}
```

## 🧪 Testing Scenarios

### 1. Basic Attendance Flow

1. **Check-in:**
   - Use `Submit Attendance (Check-in)` request
   - Set `type_attendance: 1`
   - Upload image
   - Verify response

2. **Check-out:**
   - Use `Submit Attendance (Check-out)` request
   - Set `type_attendance: 2`
   - Upload image
   - Verify response

3. **Verify Data:**
   - Use `Get All Attendances` request
   - Check if data is saved correctly

### 2. Break Time Flow

1. **Submit Break:**
   - Use `Submit Attendance Break` request
   - Set appropriate time
   - Upload image
   - Verify response

### 3. Data Management

1. **Get by ID:**
   - Use `Get Attendance by ID` request
   - Verify specific data

2. **Update:**
   - Use `Update Attendance by ID` request
   - Modify data
   - Verify changes

3. **Delete:**
   - Use `Delete Attendance by ID` request
   - Verify deletion

## 🔧 Environment Setup

### Development Environment

```json
{
  "base_url": "http://localhost:3000",
  "tenant": "company",
  "em_id": "EMP001",
  "branch_id": "BR001",
  "start_periode": "2024-01-01",
  "end_periode": "2024-01-31",
  "auth_token": "your_dev_token"
}
```

### Production Environment

```json
{
  "base_url": "https://api.myhris.com",
  "tenant": "production_company",
  "em_id": "EMP001",
  "branch_id": "BR001",
  "start_periode": "2024-01-01",
  "end_periode": "2024-01-31",
  "auth_token": "your_prod_token"
}
```

## 📊 Response Validation

### Success Response Checklist

- [ ] `status: true`
- [ ] `message` contains success message
- [ ] `data` contains attendance information
- [ ] `image_uploaded: true` (if image provided)
- [ ] `image_path` contains file path
- [ ] `original_filename` contains original filename
- [ ] `file_size` contains file size in bytes

### Error Response Checklist

- [ ] `statusCode` is appropriate HTTP code
- [ ] `message` contains error description
- [ ] `error` contains error type

## 🎯 Best Practices

1. **Always use environment variables** for sensitive data
2. **Test with different file types** and sizes
3. **Verify image upload** in response
4. **Check GPS coordinates** format
5. **Validate required fields** before submission
6. **Use proper error handling** in client code
7. **Test both success and error scenarios**
8. **Keep token secure** and refresh when needed

## 📝 Notes

- All POST requests use FormData for file upload
- GET requests use query parameters
- PUT requests use JSON body
- Authentication is required for all endpoints
- Multi-tenant support with dynamic database names
- Image files are uploaded to FTP server
- Automatic late detection and overtime calculation
- Warning letters generated automatically 