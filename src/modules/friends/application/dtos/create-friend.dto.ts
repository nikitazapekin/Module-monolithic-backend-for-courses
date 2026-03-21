import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateFriendDto {
  @ApiProperty({
    description: 'ID пользователя (auditory), который добавляет друга',
    example: 'auth_1234567890_abc123',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  clientAuditoryId: string;

  @ApiProperty({
    description: 'ID друга (auditory)',
    example: 'auth_0987654321_xyz789',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  friendAuditoryId: string;
}
