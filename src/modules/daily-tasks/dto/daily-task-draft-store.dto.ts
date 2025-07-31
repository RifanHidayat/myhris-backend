export interface InsertDraftDto {
  database: string;
  em_id: string;
  date: string;
  list_task: any[];
  status: string;
  tanggal_old: string;
  tenant?: string;
  start_periode?: string;
  end_periode?: string;
} 