import { Controller, Post, Body, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-start-period') startPeriod: string,
    @Headers('x-end-period') endPeriod: string,
  ) {
    const dtoWithHeaders = {
      ...loginDto,
      tenant,
      startPeriod,
      endPeriod,
    };

    return this.authService.login(dtoWithHeaders);
  }

  @Post('database')
  async fetchDatabase(
    @Body() loginDto: LoginDto,
    @Headers('x-tenant-id') tenant: string,
  ): Promise<any> {
    const dtoWithHeaders = {
      ...loginDto,
      tenant,
    };

    return this.authService.database(dtoWithHeaders);
  }
  // Endpoint /database yang benar
  // @Post('database')
  // async database(@Body() dto: DatabaseRequestDto) {
  //   // Implementasi sesuai kebutuhan Anda
  // }
}
