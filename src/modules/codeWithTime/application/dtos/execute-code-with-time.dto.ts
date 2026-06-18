import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export type SupportedLanguage =
  | 'javascript'
  | 'python'
  | 'csharp'
  | 'java';

export class ExecuteCodeWithTimeDto {
  @IsString()
  @IsIn(['javascript', 'python', 'csharp', 'java'])
  language: SupportedLanguage;

  @IsString()
  @IsNotEmpty()
  code: string;
}

export interface ExecuteCodeWithTimeResult {
  output: string;
  error?: string;
  executionTimeMs: number;
}
