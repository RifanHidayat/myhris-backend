import { Controller, Post, Body, Headers, UseGuards, Req, BadRequestException, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Query('tenant') tenant: string,
    @Query('start_periode') startPeriod: string,
    @Query('end_periode') endPeriod: string,
    @Req() req: any,
  ) {
    if (!loginDto) throw new BadRequestException('Request body harus diisi');
    if (!loginDto.email) throw new BadRequestException('Email harus diisi');
    if (!loginDto.password) throw new BadRequestException('Password harus diisi');
    if (!tenant) throw new BadRequestException('Tenant harus diisi');

    console.log('AuthController: Login request received');
    console.log('AuthController: Email:', loginDto.email);
    console.log('AuthController: Tenant:', tenant);
    console.log('AuthController: Start period:', startPeriod);
    console.log('AuthController: End period:', endPeriod);

    const dtoWithParams = {
      ...loginDto,
      tenant,
      startPeriod: startPeriod || '2024-01-01',
      endPeriod: endPeriod || '2024-12-31',
    };

    console.log('AuthController: Calling authService.login with:', dtoWithParams);

    return this.authService.login(dtoWithParams);
  }

  @Post('database')
  async fetchDatabase(
    @Body() loginDto: LoginDto,
    @Req() req: any,
  ): Promise<any> {
    if (!loginDto) throw new BadRequestException('Request body harus diisi');
    if (!loginDto.email) throw new BadRequestException('Email harus diisi');

    return this.authService.database(loginDto);
  }
}
