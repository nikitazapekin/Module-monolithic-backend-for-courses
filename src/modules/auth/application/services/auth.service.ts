import { Injectable, Inject, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { IAuthRepository } from '../../domain/interfaces/auth.repository.interface';
import { Auditory, UserRole } from '../../domain/entities/auditory.entity';
import { Client } from '../../domain/entities/client.entity';
import { Admin } from '../../domain/entities/admin.entity';
import { JwtService } from './jwt.service';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { AuthResponseDto } from '../dtos/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    
    const existingUser = await this.authRepository.findAuditoryByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
 
    const hashedPassword = await this.jwtService.hashPassword(registerDto.password);
 
    const auditory = new Auditory(
      registerDto.email,
      hashedPassword,
      registerDto.role || UserRole.CLIENT
    );
 
    const savedAuditory = await this.authRepository.saveAuditory(auditory);
 
    if (savedAuditory.role === UserRole.CLIENT) {
      const client = new Client(
        savedAuditory.id,
        registerDto.firstName,
        registerDto.lastName,
        registerDto.phone,
        registerDto.country,
        registerDto.middleName,
        registerDto.description
      );
      await this.authRepository.saveClient(client);
    } else if (savedAuditory.role === UserRole.ADMIN) {
      const admin = new Admin(
        savedAuditory.id,
        registerDto.firstName,
        registerDto.lastName,
        registerDto.phone,
        registerDto.country,
        ['read', 'write'],  
        registerDto.middleName,
        registerDto.description
      );
      await this.authRepository.saveAdmin(admin);
    }

     
    const fullAuditory = await this.authRepository.findAuditoryById(savedAuditory.id);
    if (!fullAuditory) {
      throw new Error('Failed to retrieve created user');
    }
 
    let client: Client | null;
    let admin: Admin | null;

    if (fullAuditory.role === UserRole.CLIENT) {
      
      client = await this.authRepository.findClientByAuditoryId(fullAuditory.id);
    } else {
      admin = await this.authRepository.findAdminByAuditoryId(fullAuditory.id);
    }

   
    return this.jwtService.createAuthResponse(
      fullAuditory.id,
      fullAuditory.email,
      fullAuditory.role,
      client!,
      admin!
    );
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    
    const auditory = await this.authRepository.findAuditoryByEmail(loginDto.email);
    if (!auditory) {
      throw new UnauthorizedException('Invalid credentials');
    }
 
    if (!auditory.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }
 
    const isPasswordValid = await this.jwtService.comparePasswords(
      loginDto.password,
      auditory.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
 
    auditory.markAsLoggedIn();
    await this.authRepository.updateAuditory(auditory.id, {
      lastLoginAt: auditory.lastLoginAt,
    });
 
    let client: Client | null;
    let admin: Admin | null;

    if (auditory.role === UserRole.CLIENT) {
      client = await this.authRepository.findClientByAuditoryId(auditory.id);
    } else {
      admin = await this.authRepository.findAdminByAuditoryId(auditory.id);
    }
 
    return this.jwtService.createAuthResponse(
      auditory.id,
      auditory.email,
      auditory.role,
      client!,
      admin!
    );
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    // Верифицируем refresh токен
    const payload = await this.jwtService.verifyToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }
 
    const auditory = await this.authRepository.findAuditoryById(payload.sub);
    if (!auditory || !auditory.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
 
    let client: Client | null;
    let admin: Admin | null;

    if (auditory.role === UserRole.CLIENT) {
      client = await this.authRepository.findClientByAuditoryId(auditory.id);
    } else {
      admin = await this.authRepository.findAdminByAuditoryId(auditory.id);
    }

    // Создаем новые токены
    return this.jwtService.createAuthResponse(
      auditory.id,
      auditory.email,
      auditory.role,
      client!,
      admin!
    );
  }

  async logout(userId: string): Promise<{ success: boolean }> {
  
    return { success: true };
  }

  async validateToken(accessToken: string): Promise<{ isValid: boolean; payload?: any }> {
    if (!accessToken) {
      return { isValid: false };
    }
 
    if (this.jwtService.isTokenExpired(accessToken)) {
      return { isValid: false };
    }
 
    const payload = await this.jwtService.verifyToken(accessToken);
    if (!payload) {
      return { isValid: false };
    }
 
    const auditory = await this.authRepository.findAuditoryById(payload.sub);
    if (!auditory || !auditory.isActive) {
      return { isValid: false };
    }

    return { isValid: true, payload };
  }

  async getProfile(userId: string): Promise<any> {
    const auditory = await this.authRepository.findAuditoryById(userId);
    if (!auditory) {
      throw new UnauthorizedException('User not found');
    }

    let profile: any;
    if (auditory.role === UserRole.CLIENT) {
      profile = await this.authRepository.findClientByAuditoryId(auditory.id);
    } else {
      profile = await this.authRepository.findAdminByAuditoryId(auditory.id);
    }

    return {
      auditory: {
        id: auditory.id,
        email: auditory.email,
        role: auditory.role,
        isActive: auditory.isActive,
        createdAt: auditory.createdAt,
        lastLoginAt: auditory.lastLoginAt,
      },
      profile,
    };
  }
}
