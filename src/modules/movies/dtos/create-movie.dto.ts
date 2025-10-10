import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class CreateMovieDto {
  @IsString()
  title: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  genreNames: string[];
}
