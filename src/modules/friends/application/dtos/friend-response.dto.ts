import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class FriendResponseDto {
  @ApiProperty({
    description: 'ID записи дружбы',
    example: 'friend_1234567890_abc123',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'ID клиента',
    example: 'client_1234567890_abc123',
  })
  @Expose()
  clientId: string;

  @ApiProperty({
    description: 'ID друга',
    example: 'client_0987654321_xyz789',
  })
  @Expose()
  friendId: string;

  @ApiProperty({
    description: 'Имя друга',
    example: 'John',
  })
  @Expose()
  friendFirstName?: string;

  @ApiProperty({
    description: 'Фамилия друга',
    example: 'Doe',
  })
  @Expose()
  friendLastName?: string;

  @ApiProperty({
    description: 'Отчество друга (если есть)',
    example: 'Smith',
    required: false,
  })
  @Expose()
  friendMiddleName?: string;

  @ApiProperty({
    description: 'Дата создания записи',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Дата обновления записи',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  updatedAt: Date;
}
