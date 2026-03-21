import { ApiProperty } from '@nestjs/swagger';

export class StudentResponseDto {
  @ApiProperty({ example: 'client-123' })
  id: string;

  @ApiProperty({ example: 'auditory-123' })
  auditoryId: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: 'student' })
  role: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: 'Ivanovich', required: false })
  middleName?: string;

  @ApiProperty({ example: '+1234567890' })
  phone: string;

  @ApiProperty({ example: 'USA' })
  country: string;

  @ApiProperty({ example: 'Active student', required: false })
  description?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  registeredAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', required: false })
  lastLoginAt?: Date;

  @ApiProperty({ example: true })
  isActive: boolean;
}
