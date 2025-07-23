import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class LoginDto {
  // DTO default yang harus ada
  @IsNotEmpty({ message: 'Tenant harus diisi' })
  tenant: string;

  @IsOptional()
  startPeriod?: string;

  @IsOptional()
  endPeriod?: string;

  @IsOptional()
  endId?: string;

  //--------------------------------

  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  password: string;

  @IsOptional()
  tokenNotif?: string;
}
