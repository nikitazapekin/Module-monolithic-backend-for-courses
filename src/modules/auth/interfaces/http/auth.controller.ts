import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../../application/services/auth.service';
import { LoginDto } from '../../application/dtos/login.dto';
import { RegisterDto } from '../../application/dtos/register.dto';
import { RefreshTokenDto } from '../../application/dtos/refresh-token.dto';
import { AuthResponseDto } from '../../application/dtos/auth-response.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Пользователь успешно зарегистрирован',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Пользователь с таким email уже существует',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Невалидные данные',
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход в систему' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Успешный вход',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Неверные учетные данные',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Обновление access токена' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Токен успешно обновлен',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Невалидный refresh токен',
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Выход из системы' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Успешный выход',
  })
  async logout(@Headers('authorization') authHeader: string): Promise<{ success: boolean }> {
    // Извлекаем userId из токена
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      throw new BadRequestException('No token provided');
    }

    // В реальном приложении здесь нужно извлечь userId из токена
    // или использовать @User() декоратор
    return this.authService.logout('user-id-from-token');
  }

  @Post('validate')
  @ApiOperation({ summary: 'Проверка валидности токена' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Токен валиден',
    schema: {
      type: 'object',
      properties: {
        isValid: { type: 'boolean' },
        expiresAt: { type: 'string', format: 'date-time' },
        userId: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'string', enum: ['client', 'admin'] },
      },
    },
  })
  async validate(@Body('token') token: string): Promise<any> {
    const result = await this.authService.validateToken(token);
    
    if (!result.isValid) {
      return { isValid: false };
    }

    // Дополнительная информация о токене
    const decoded = result.payload;
    return {
      isValid: true,
      expiresAt: new Date(decoded.exp * 1000),
      userId: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получение профиля текущего пользователя' })
  async getProfile(@Headers('authorization') authHeader: string): Promise<any> {
    // В реальном приложении используйте @User() декоратор
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      throw new BadRequestException('No token provided');
    }

    // Здесь нужно извлечь userId из токена
    // Для демонстрации используем заглушку
    return this.authService.getProfile('user-id-from-token');
  }
}
