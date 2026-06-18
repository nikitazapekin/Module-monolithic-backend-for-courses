import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';

export class SearchFriendsDto {
  @ApiProperty({
    description: 'ID пользователя (auditory), который ищет друзей',
    example: 'auth_1234567890_abc123',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  clientAuditoryId: string;

  @ApiProperty({
    description: 'Поисковый запрос (часть имени или фамилии)',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  query: string;
}
