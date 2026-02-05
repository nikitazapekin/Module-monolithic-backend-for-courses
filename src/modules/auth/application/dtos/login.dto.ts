import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Expose } from 'class-transformer';

export class LoginDto {
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
}
