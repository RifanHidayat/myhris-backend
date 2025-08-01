// Store DTO
export interface FieldAssigmentsStoreDto {
  tenant: string;
  em_id: string;
  branch_id: string;
  date: string;
  start_time: string;
  end_time: string;
  delegation_id: string;
  catatan: string;
  created_by?: string;
  start_periode?: string;
  end_periode?: string;
}

// Update DTO for PATCH
export interface FieldAssigmentsUpdateDto {
  tenant: string;
  nomor_ajuan: string;
  start_periode?: string;
  end_periode?: string;
  start_time?: string;
  end_time?: string;
  delegation_id?: string;
  catatan?: string;
}

// PATCH DTO - only updateable fields
export interface FieldAssigmentsPatchDto {
  start_time?: string;
  end_time?: string;
  delegation_id?: string;
  catatan?: string;
}

// List DTO
export interface FieldAssigmentsListDto {
  tenant: string;
  em_id?: string;
  nomor_ajuan?: string;
  start_periode: string;
  end_periode: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}

// Delete DTO
export interface FieldAssigmentsDeleteDto {
  tenant: string;
  nomor_ajuan: string;
  start_periode: string;
  end_periode: string;
}
