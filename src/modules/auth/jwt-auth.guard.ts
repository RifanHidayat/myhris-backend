// src/modules/auth/jwt-auth.guard.ts

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    console.log('🛡️ JwtAuthGuard: canActivate() method called!');
    const request = context.switchToHttp().getRequest();
    console.log('🛡️ JwtAuthGuard: Request URL:', request.url);
    console.log('🛡️ JwtAuthGuard: Authorization header:', request.headers.authorization);
    console.log('🛡️ JwtAuthGuard: Method:', request.method);
    
    const result = super.canActivate(context);
    console.log('🛡️ JwtAuthGuard: canActivate result:', result);
    return result;
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    console.log('🛡️ JwtAuthGuard: handleRequest() method called!');
    console.log('🛡️ JwtAuthGuard: Error:', err);
    console.log('🛡️ JwtAuthGuard: User:', user);
    console.log('🛡️ JwtAuthGuard: Info:', info);
    
    if (err || !user) {
      console.log('🛡️ JwtAuthGuard: Authentication failed!');
      throw err || new UnauthorizedException('Unauthorized');
    }
    
    console.log('🛡️ JwtAuthGuard: Authentication successful!');
    return user;
  }
}
