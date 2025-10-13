import { ArrayNotEmpty, IsArray, IsNumber, IsString } from 'class-validator';

export class CreateMovieDto {
  @IsString()
  title: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  genreNames: string[];

  @IsNumber()
  directorId: number;
}
