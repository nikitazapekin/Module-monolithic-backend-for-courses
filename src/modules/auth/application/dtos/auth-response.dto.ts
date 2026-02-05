import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export enum UserRole {
  CLIENT = 'client',
  ADMIN = 'admin'
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'Access токен',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @Expose()
  accessToken: string;

  @ApiProperty({
    description: 'Refresh токен',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @Expose()
  refreshToken: string;

  @ApiProperty({
    description: 'Время истечения access токена',
    example: '2024-02-06T19:30:00.000Z',
  })
  @Expose()
  expiresIn: Date;

  @ApiProperty({
    description: 'Тип токена',
    example: 'Bearer',
  })
  @Expose()
  tokenType: string;

  @ApiProperty({
    description: 'ID пользователя',
    example: 'auth_1707234567890_abc123',
  })
  @Expose()
  userId: string;

  @ApiProperty({
    description: 'Email пользователя',
    example: 'user@example.com',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'Роль пользователя',
    enum: UserRole,
    example: UserRole.CLIENT,
  })
  @Expose()
  role: UserRole;

  @ApiProperty({
    description: 'Полное имя пользователя',
    example: 'Иванов Иван Иванович',
  })
  @Expose()
  fullName: string;
}
