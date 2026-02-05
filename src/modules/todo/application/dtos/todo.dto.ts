// DTO - объект для передачи данных между слоями
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TodoDto {
  @ApiProperty({ description: 'Unique identifier' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Todo title', maxLength: 100 })
  @Expose()
  title: string;

  @ApiProperty({ description: 'Todo description', required: false })
  @Expose()
  description?: string;

  @ApiProperty({ description: 'Completion status' })
  @Expose()
  isCompleted: boolean;

  @ApiProperty({ description: 'Creation date' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  @Expose()
  updatedAt: Date;
}
