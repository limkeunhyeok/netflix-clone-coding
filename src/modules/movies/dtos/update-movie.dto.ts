import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateMovieDto {
  @IsOptional()
  @IsNotEmpty()
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

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  detail?: string;
}
