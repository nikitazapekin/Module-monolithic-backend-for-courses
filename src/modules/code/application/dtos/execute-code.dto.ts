import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export type SupportedLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'php'
  | 'ruby'
  | 'rust'
  | 'csharp'
  | 'golang'
  | 'java';

export class ExecuteCodeDto {
  @IsString()
  @IsIn([
    'javascript',
    'typescript',
    'python',
    'php',
    'ruby',
    'rust',
    'csharp',
    'golang',
    'java',
  ])
  language: SupportedLanguage;

  @IsString()
  @IsNotEmpty()
  code: string;
}
