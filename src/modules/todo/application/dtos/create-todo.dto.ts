import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateTodoDto {
  @ApiProperty({
    description: 'Todo title',
    example: 'Buy groceries',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Expose()
  title: string;

  @ApiProperty({
    description: 'Todo description',
    example: 'Milk, eggs, bread',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Expose()
  description?: string;
}
