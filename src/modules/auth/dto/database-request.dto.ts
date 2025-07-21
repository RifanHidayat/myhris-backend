import { IsString } from 'class-validator';

export class DatabaseRequestDto {
  @IsString()
  database: string;

  @IsString()
  email: string;
}; 