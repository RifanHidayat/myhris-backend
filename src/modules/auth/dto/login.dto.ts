import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  password: string;

  @IsNotEmpty({ message: 'Tenant harus diisi' })
  tenant: string;

  @IsOptional()
  startPeriod?: string;

  @IsOptional()
  endPeriod?: string;
}
