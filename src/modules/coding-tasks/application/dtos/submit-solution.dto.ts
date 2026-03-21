import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SubmitSolutionDto {
  @ApiProperty({ example: 'task-id-123' })
  @IsString()
  taskId: string;

  @ApiProperty({ example: 'function twoSum(nums, target) { ... }' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'javascript' })
  @IsString()
  language: string;
}
