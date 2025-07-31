import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    // Use hardcoded secret for testing
    const secret = '9f$G7!kL2@xPz#Qw8^mN1&bV5*eR6sT0';
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    });
    console.log('🔐 JwtStrategy: Secret key configured (hardcoded):', secret ? '***SET***' : '***NOT SET***');
    console.log('🔐 JwtStrategy: Secret key length:', secret?.length || 0);
  }

  validate(payload: any) {
    console.log('🔐 JwtStrategy: validate() method called!');
    console.log('🔐 JwtStrategy: Raw payload received:', payload);
    console.log('🔐 JwtStrategy: Payload type:', typeof payload);
    console.log('🔐 JwtStrategy: Payload keys:', Object.keys(payload || {}));
    
    // Handle different payload structures
    const result = {
      userId: payload.sub || payload.id || payload.userId,
      email: payload.email,
      tenant: payload.tenant,
      startPeriod: payload.startPeriod,
      endPeriod: payload.endPeriod,
    };
    
    console.log('🔐 JwtStrategy: Processed user data:', result);
    console.log('🔐 JwtStrategy: validate() method completed successfully');
    return result;
  }
}
