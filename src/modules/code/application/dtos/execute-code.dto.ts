import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export type SupportedLanguage = 'javascript' | 'python' | 'csharp' | 'golang';

export class ExecuteCodeDto {
  @IsString()
  @IsIn(['javascript', 'python', 'csharp', 'golang'])
  language: SupportedLanguage;

  @IsString()
  @IsNotEmpty()
  code: string;
}

