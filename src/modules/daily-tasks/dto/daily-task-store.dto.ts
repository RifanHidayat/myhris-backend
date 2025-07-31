export interface DailyTasksStoreDto {
  em_id: string;
  date: string;
  list_tasks: Array<{
    task: string;
    title: string;
    status: string;
    level: number;
    finish_date: string;
  }>;
  status: string;
  id?: string;
  tenant: string;
  start_periode?: string;
  end_periode?: string;
} 