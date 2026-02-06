import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IAuthRepository } from '../domain/interfaces/auth.repository.interface';
import { UserRole } from '../domain/entities/auditory.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'super-secret-key-change-in-production',
    });
  }

  async validate(payload: any) {
 
    const auditory = await this.authRepository.findAuditoryById(payload.sub);
    
    if (!auditory) {
      throw new Error('User not found');
    }

    if (!auditory.isActive) {
      throw new Error('User is deactivated');
    }
 
    let profile: any;
    if (auditory.role === UserRole.CLIENT) {
      profile = await this.authRepository.findClientByAuditoryId(auditory.id);
    } else {
      profile = await this.authRepository.findAdminByAuditoryId(auditory.id);
    }

    return {
      userId: auditory.id,
      email: auditory.email,
      role: auditory.role as UserRole,
      profile,
    };
  }
}
