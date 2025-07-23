// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// // Import named types langsung dari passport-jwt
// import { Strategy, ExtractJwt, JwtFromRequestFunction } from 'passport-jwt';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor() {
//     // Definisikan dulu jwtFromRequest dengan tipe yang jelas
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//     const jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken() as unknown as JwtFromRequestFunction;

//     super({
//       jwtFromRequest,
//       secretOrKey: process.env.JWT_SECRET || 'secretKey',
//     });
//   }

//   async validate(payload: any) {
//     return { userId: payload.sub, username: payload.username };
//   }
// }
