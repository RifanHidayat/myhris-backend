// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import * as bcrypt from 'bcrypt';
// import { db } from '../../database/db.service'; // knex instance

// @Injectable()
// export class AuthService {
//   constructor(private jwtService: JwtService) {}

//   async validateUser(email: string, password: string) {
//     const user = await db('users').where({ email }).first();
//     if (!user) return null;

//     const passwordValid = await bcrypt.compare(password, user.password);
//     if (!passwordValid) return null;

//     return user;
//   }

//   async login(loginDto: { email: string; password: string }) {
//     const user = await this.validateUser(loginDto.email, loginDto.password);

//     if (!user) {
//       throw new UnauthorizedException('Email atau password salah');
//     }

//     const payload = { sub: user.id, email: user.email };
//     return {
//       access_token: this.jwtService.sign(payload),
//       user: {
//         id: user.id,
//         fullName: user.full_name,
//         email: user.email,
//       },
//     };
//   }
// }
