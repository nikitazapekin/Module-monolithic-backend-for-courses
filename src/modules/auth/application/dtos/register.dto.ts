import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { Expose } from 'class-transformer';
import { UserRole } from './auth-response.dto'; // Используем локальный enum

export class RegisterDto {
  @ApiProperty({
    description: 'Email пользователя',
    example: 'user@example.com',
  })
  @IsEmail()
  @Expose()
  email: string;

  @ApiProperty({
    description: 'Пароль',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  @Expose()
  password: string;

  @ApiProperty({
    description: 'Имя',
    example: 'Иван',
  })
  @IsString()
  @Expose()
  firstName: string;

  @ApiProperty({
    description: 'Фамилия',
    example: 'Иванов',
  })
  @IsString()
  @Expose()
  lastName: string;

  @ApiProperty({
    description: 'Отчество',
    example: 'Иванович',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Expose()
  middleName?: string;

  @ApiProperty({
    description: 'Телефон',
    example: '+79991234567',
  })
  @IsString()
  @Expose()
  phone: string;

  @ApiProperty({
    description: 'Страна',
    example: 'Россия',
  })
  @IsString()
  @Expose()
  country: string;

  @ApiProperty({
    description: 'Описание',
    example: 'О себе',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Expose()
  description?: string;

  @ApiProperty({
    description: 'Роль пользователя',
    enum: UserRole,
    default: UserRole.CLIENT,
    required: false,
  })
  @IsEnum(UserRole)
  @IsOptional()
  @Expose()
  role?: UserRole;
}
