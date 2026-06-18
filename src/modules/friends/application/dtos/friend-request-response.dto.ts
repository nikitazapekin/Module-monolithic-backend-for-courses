import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class FriendRequestResponseDto {
  @ApiProperty({
    description: 'ID заявки в друзья',
    example: 'friend_request_1234567890_abc123',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'ID отправителя заявки',
    example: 'client_1234567890_abc123',
  })
  @Expose()
  senderId: string;

  @ApiProperty({
    description: 'ID получателя заявки',
    example: 'client_0987654321_xyz789',
  })
  @Expose()
  receiverId: string;

  @ApiProperty({
    description: 'Статус заявки',
    example: 'pending',
  })
  @Expose()
  status: string;

  @ApiProperty({
    description: 'Аудиторный ID отправителя',
    example: '123456',
    required: false,
  })
  @Expose()
  senderAuditoryId?: string;

  @ApiProperty({
    description: 'Имя отправителя',
    example: 'John',
    required: false,
  })
  @Expose()
  senderFirstName?: string;

  @ApiProperty({
    description: 'Фамилия отправителя',
    example: 'Doe',
    required: false,
  })
  @Expose()
  senderLastName?: string;

  @ApiProperty({
    description: 'Отчество отправителя',
    example: 'Smith',
    required: false,
  })
  @Expose()
  senderMiddleName?: string;

  @ApiProperty({
    description: 'Аудиторный ID получателя',
    example: '654321',
    required: false,
  })
  @Expose()
  receiverAuditoryId?: string;

  @ApiProperty({
    description: 'Имя получателя',
    example: 'Jane',
    required: false,
  })
  @Expose()
  receiverFirstName?: string;

  @ApiProperty({
    description: 'Фамилия получателя',
    example: 'Doe',
    required: false,
  })
  @Expose()
  receiverLastName?: string;

  @ApiProperty({
    description: 'Отчество получателя',
    example: 'Ann',
    required: false,
  })
  @Expose()
  receiverMiddleName?: string;

  @ApiProperty({
    description: 'Дата создания заявки',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Дата обновления заявки',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  updatedAt: Date;
}
