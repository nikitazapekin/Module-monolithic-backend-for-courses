import { Injectable, Inject } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { UserRole } from '@modules/auth/domain/entities/auditory.entity';
import { Client } from '@modules/auth/domain/entities/client.entity';
import { Admin } from '@modules/auth/domain/entities/admin.entity';

@Injectable()
export class JwtService {
  private readonly jwtSecret: string;
  private readonly accessTokenExpiresIn: string;
  private readonly refreshTokenExpiresIn: string;

  constructor(
    @Inject(NestJwtService)
    private readonly nestJwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.get<string>('JWT_SECRET') || 'super-secret-key-change-in-production';
    this.accessTokenExpiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES') || '15m';
    this.refreshTokenExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES') || '7d';
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async generateAccessToken(payload: any): Promise<string> {
    return this.nestJwtService.signAsync(payload, {
      secret: this.jwtSecret,
      expiresIn: this.accessTokenExpiresIn,
    });
  }

  async generateRefreshToken(payload: any): Promise<string> {
    return this.nestJwtService.signAsync(payload, {
      secret: this.jwtSecret,
      expiresIn: this.refreshTokenExpiresIn,
    });
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return this.nestJwtService.verifyAsync(token, {
        secret: this.jwtSecret,
      });
    } catch (error) {
      return null;
    }
  }

// В методе createAuthResponse можно оставить возвращение refreshToken для внутреннего использования
async createAuthResponse(
  userId: string,
  email: string,
  role: UserRole,
  client?: Client,
  admin?: Admin,
): Promise<AuthResponseDto & { refreshToken: string }> {  
  const payload = {
    sub: userId,
    email,
    role,
  };

  const [accessToken, refreshToken] = await Promise.all([
    this.generateAccessToken(payload),
    this.generateRefreshToken(payload),
  ]);

  const decoded = this.nestJwtService.decode(accessToken) as any;
  const expiresIn = decoded ? new Date(decoded.exp * 1000) : new Date(Date.now() + 15 * 60 * 1000);

  let fullName = '';
  if (role === UserRole.CLIENT && client) {
    fullName = client.getFullName();
  } else if (role === UserRole.ADMIN && admin) {
    fullName = admin.getFullName();
  }

  return {
    accessToken,
    refreshToken, 
    expiresIn,
    tokenType: 'Bearer',
    userId,
    email,
    role,
    fullName,
  };
}

  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.nestJwtService.decode(token) as any;
      if (!decoded || !decoded.exp) {
        return true;
      }
      
      const expirationTime = decoded.exp * 1000;  
      return Date.now() >= expirationTime;
    } catch (error) {
      return true;
    }
  }
}
