import { ApiProperty } from '@nestjs/swagger';
import { AvatarResponseDto } from './avatar-response.dto';
import { StudentResultResponseDto } from './student-result-response.dto';

export class FullClientInfoDto {
  @ApiProperty({ description: 'Client ID' })
  clientId: string;

  @ApiProperty({ description: 'Auditory ID (auth account)' })
  auditoryId: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'Account role' })
  role: string;

  @ApiProperty({ description: 'Account active status' })
  isActive: boolean;

  @ApiProperty({ description: 'First name' })
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  lastName: string;

  @ApiProperty({ description: 'Middle name', required: false })
  middleName?: string;

  @ApiProperty({ description: 'Phone number' })
  phone: string;

  @ApiProperty({ description: 'Country' })
  country: string;

  @ApiProperty({ description: 'Description', required: false })
  description?: string;

  @ApiProperty({ description: 'Registration date' })
  registeredAt: Date;

  @ApiProperty({ description: 'Last login date', required: false })
  lastLoginAt?: Date;

  @ApiProperty({ description: 'Avatar information', required: false })
  avatar?: AvatarResponseDto;

  @ApiProperty({ description: 'Student results', type: [StudentResultResponseDto] })
  studentResults: StudentResultResponseDto[];

  @ApiProperty({ description: 'Total lessons completed' })
  totalLessons: number;

  @ApiProperty({ description: 'Average stars rating' })
  averageStars: number;
}
