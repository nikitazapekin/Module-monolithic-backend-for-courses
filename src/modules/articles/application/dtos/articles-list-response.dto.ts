import { ApiProperty } from '@nestjs/swagger';
import { ArticleResponseDto } from './article-response.dto';

export class ArticlesListResponseDto {
  @ApiProperty({ type: () => [ArticleResponseDto] })
  items: ArticleResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pages: number;
}
