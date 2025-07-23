import { IsString } from 'class-validator';

export class EmployeeDetailDto {
  @IsString()
  database: string;

  @IsString()
  em_id: string;
}
