import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './interfaces/http/auth.controller';
import { AuthService } from './application/services/auth.service';
import { JwtService } from './application/services/jwt.service';
import { AuthRepository } from './infra/repositories/auth.repository.impl';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuditoryOrmEntity } from './infra/typeorm/auditory.orm-entity';
import { ClientOrmEntity } from './infra/typeorm/client.orm-entity';
import { AdminOrmEntity } from './infra/typeorm/admin.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuditoryOrmEntity,
      ClientOrmEntity,
      AdminOrmEntity,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          'super-secret-key-change-in-production',
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES') || '15m',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    JwtStrategy,
    JwtAuthGuard,
    {
      provide: 'IAuthRepository',
      useClass: AuthRepository,
    },
  ],
  exports: [AuthService, JwtService, JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}
