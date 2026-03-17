// src/modules/auth/interfaces/http/auth.controller.ts
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
  Res,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthService } from '../../application/services/auth.service';
import { LoginDto } from '../../application/dtos/login.dto';
import { RegisterDto } from '../../application/dtos/register.dto';
import {
  AuthResponseDto,
  AuthResponseWithRefreshDto,
} from '../../application/dtos/auth-response.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Пользователь успешно зарегистрирован',
    type: AuthResponseDto,
  })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const authResponse = (await this.authService.register(
      registerDto,
    )) as AuthResponseWithRefreshDto;

    // Устанавливаем refresh token в cookie
    this.setRefreshTokenCookie(response, authResponse.refreshToken);

    // Создаем ответ без refresh token
    const { refreshToken, ...responseWithoutRefresh } = authResponse;

    return responseWithoutRefresh;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход в систему' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Успешный вход',
    type: AuthResponseDto,
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    console.log('LOGIN', loginDto);
    const authResponse = (await this.authService.login(
      loginDto,
    )) as AuthResponseWithRefreshDto;

    // Устанавливаем refresh token в cookie
    this.setRefreshTokenCookie(response, authResponse.refreshToken);

    // Создаем ответ без refresh token
    const { refreshToken, ...responseWithoutRefresh } = authResponse;

    return responseWithoutRefresh;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Обновление access токена' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Токен успешно обновлен',
    type: AuthResponseDto,
  })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const refreshToken = request.cookies['refresh-token'];

    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    const authResponse = (await this.authService.refreshToken(
      refreshToken,
    )) as AuthResponseWithRefreshDto;

    this.setRefreshTokenCookie(response, authResponse.refreshToken);

    const { refreshToken: newRefreshToken, ...responseWithoutRefresh } =
      authResponse;

    return responseWithoutRefresh;
  }

  private setRefreshTokenCookie(
    response: Response,
    refreshToken: string,
  ): void {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    response.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
      ...(isProduction && { domain: this.configService.get('COOKIE_DOMAIN') }),
    });
  }

  private clearRefreshTokenCookie(response: Response): void {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    response.clearCookie('refresh-token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
      ...(isProduction && { domain: this.configService.get('COOKIE_DOMAIN') }),
    });
  }
}
