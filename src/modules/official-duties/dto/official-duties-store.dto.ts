export interface OfficialDutiesStoreDto {
  tenant: string;
  em_id: string;
  date_selected: string[];
  time_plan: string;
  time_plan_to: string;
  reason: string;
  em_delegation_id: string;
  leave_files?: string;
  start_periode?: string;
  end_periode?: string;
} 