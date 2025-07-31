import { IsString } from 'class-validator';

export class DatabaseRequestDto {
  @IsString()
  email: string;

  @IsString()
  password: string;
}
