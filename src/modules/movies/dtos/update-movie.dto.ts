import {
  ArrayNotEmpty,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateMovieDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  genreNames?: string[];

  @IsOptional()
  @IsNumber()
  directorId?: number;
}
