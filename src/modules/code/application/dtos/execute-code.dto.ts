import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export type SupportedLanguage =
  | 'javascript'
  | 'python'
  | 'csharp'
  | 'golang'
  | 'java';

export class ExecuteCodeDto {
  @IsString()
  @IsIn(['javascript', 'python', 'csharp', 'golang', 'java'])
  language: SupportedLanguage;

  @IsString()
  @IsNotEmpty()
  code: string;
}
