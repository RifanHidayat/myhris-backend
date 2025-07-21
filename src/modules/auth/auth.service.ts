import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DbService } from '../../config/database.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly dbService: DbService,
  ) {}

  async validateUser(email: string, password: string, tenant: string) {
    if (!tenant) throw new BadRequestException('Tenant harus diisi');

    // Ambil koneksi berdasarkan tenant
    const knex = this.dbService.getConnection(tenant);

    // Query builder pakai knex
    const user = await knex('users').where({ email }).first();

    if (!user) return null;

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) return null;

    return user;
  }


  async login(loginDto: LoginDto) {
  const { email, password, tenant } = loginDto;

  const user = await this.validateUser(email, password, tenant);

  if (!user) {
    throw new UnauthorizedException('Email atau password salah');
  }

  const payload = {
    sub: user.id,
    email: user.email,
    tenant,
  };

  const access_token = this.jwtService.sign(payload, {
    expiresIn: '1h',
  });

  return {
    token_type: 'Bearer',
    access_token,
    expires_in: 3600,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
    },
  };
}
}
