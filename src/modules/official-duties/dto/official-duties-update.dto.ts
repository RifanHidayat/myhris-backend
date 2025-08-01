export interface OfficialDutiesUpdateDto {
  tenant: string;
  nomor_ajuan: string;
  time_plan?: string;
  time_plan_to?: string;
  reason?: string;
  em_delegation_id?: string;
  leave_files?: string;
  start_periode?: string;
  end_periode?: string;
} 