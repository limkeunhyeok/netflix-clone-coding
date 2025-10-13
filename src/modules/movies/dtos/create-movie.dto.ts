import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateMovieDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  genreNames: string[];

  @IsNumber()
  directorId: number;

  @IsNotEmpty()
  @IsString()
  detail: string;
}
