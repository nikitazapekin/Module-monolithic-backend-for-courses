import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { Expose } from 'class-transformer';
import { FriendRequestStatus } from '../../domain/entities/friend-request.entity';

export class CreateFriendRequestDto {
  @ApiProperty({
    description: 'ID отправителя заявки (auditory)',
    example: 'auth_1234567890_abc123',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  senderAuditoryId: string;

  @ApiProperty({
    description: 'ID получателя заявки (auditory)',
    example: 'auth_0987654321_xyz789',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  receiverAuditoryId: string;
}

export class UpdateFriendRequestDto {
  @ApiProperty({
    description: 'Статус заявки',
    enum: FriendRequestStatus,
    example: FriendRequestStatus.ACCEPTED,
  })
  @IsEnum(FriendRequestStatus)
  @IsNotEmpty()
  @Expose()
  status: FriendRequestStatus;
}
