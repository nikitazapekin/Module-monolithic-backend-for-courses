import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export class CreateCodeTaskDto {
  @ApiProperty({ example: 'Two Sum' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Given an array of integers...' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'javascript' })
  @IsString()
  language: string;

  @ApiProperty({ example: 'function twoSum(nums, target) {\n  // your code\n}' })
  @IsString()
  startCode: string;

  @ApiProperty({ type: 'array', example: [{ input: '[2,7,11,15], 9', expectedOutput: '[0,1]' }] })
  @IsArray()
  testCases: Array<{ input: string; expectedOutput: string }>;

  @ApiProperty({ type: 'array', example: [], required: false })
  @IsArray()
  @IsOptional()
  constraints?: Array<{ type: string; value: any }>;

  @ApiProperty({ enum: ['easy', 'medium', 'hard'], example: 'easy' })
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  experienceReward: number;
}
