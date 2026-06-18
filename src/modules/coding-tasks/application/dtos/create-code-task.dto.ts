import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsObject,
  Min,
} from 'class-validator';

export class TestCaseArgumentDto {
  index: number;
  value: string;
  objectValues?: Record<string, string>;
}

export class TestCaseDto {
  input: string;
  expectedOutput: unknown;
  args?: TestCaseArgumentDto[];
  expectedObjectValues?: Record<string, string>;
}

export class ArgumentSchemaDto {
  name: string;
  type: string;
  className?: string;
  arrayElementType?: string;
  arrayElementClassName?: string;
  objectFields?: { name: string; type: string; value: string }[];
  arrayElementObjectFields?: { name: string; type: string; value: string }[];
}

export class CreateCodeTaskDto {
  @ApiProperty({ example: 'Two Sum' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Given an array of integers...' })
  @IsString()
  description: string;

  @ApiProperty({
    example: 'twoSum',
    required: false,
    description:
      'Explicit target function name for validation. If omitted, the system falls back to extracting a function from the submitted code.',
  })
  @IsOptional()
  @IsString()
  functionName?: string;

  @ApiProperty({
    type: 'array',
    example: ['JavaScript', 'Массивы', 'Хеш-таблица'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({ example: ['javascript', 'python'] })
  @IsArray()
  languages: string[];

  @ApiProperty({
    example: {
      javascript: 'function twoSum(nums, target) {\n  // your code\n}',
      python: 'def two_sum(nums, target):\n    pass',
    },
  })
  @IsObject()
  startCodes: Record<string, string>;

  @ApiProperty({
    type: 'array',
    example: [{ input: '[2,7,11,15], 9', expectedOutput: '[0,1]' }],
  })
  @IsArray()
  testCases: TestCaseDto[];

  @ApiProperty({ type: 'array', example: {}, required: false })
  @IsOptional()
  testCasesByLanguage?: Record<string, TestCaseDto[]>;

  @ApiProperty({ type: 'array', example: [], required: false })
  @IsArray()
  @IsOptional()
  constraints?: Array<{ type: string; value: any }>;

  @ApiProperty({ type: 'array', example: [], required: false })
  @IsArray()
  @IsOptional()
  argumentScheme?: ArgumentSchemaDto[];

  @ApiProperty({ example: 'int', required: false })
  @IsOptional()
  returnType?: string;

 
  @IsOptional()
  @IsObject()
  returnSchema?: Record<string, unknown>;

  @ApiProperty({ enum: ['easy', 'medium', 'hard'], example: 'easy' })
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  experienceReward: number;
}
