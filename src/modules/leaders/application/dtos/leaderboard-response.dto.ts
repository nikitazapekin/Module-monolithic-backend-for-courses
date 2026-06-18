import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LeaderEntryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  clientId: string;

  @ApiProperty()
  auditoryId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiPropertyOptional({ nullable: true })
  middleName?: string | null;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  score: number;

  @ApiProperty()
  rank: number;

  @ApiProperty()
  level: number;

  @ApiPropertyOptional({ nullable: true })
  avatarUrl?: string | null;

  @ApiPropertyOptional({ nullable: true })
  avatarMimeType?: string | null;
}

export class LeaderboardResponseDto {
  @ApiProperty({ type: [LeaderEntryDto] })
  leaders: LeaderEntryDto[];

  @ApiPropertyOptional({ type: LeaderEntryDto, nullable: true })
  currentUser: LeaderEntryDto | null;

  @ApiProperty()
  totalStudents: number;

  @ApiProperty()
  page: number;

  @ApiProperty({ example: 50 })
  limit: number;

  @ApiProperty()
  totalPages: number;
}
