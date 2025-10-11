import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class CreateDirectorDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsDate()
  dob: Date;

  @IsNotEmpty()
  @IsString()
  nationality: string;
}
