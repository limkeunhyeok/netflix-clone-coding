import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectorModule } from '../directors/director.module';
import { GenreModule } from '../genres/genre.module';
import { Movie } from './entities/movie.entity';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';

@Module({
  imports: [TypeOrmModule.forFeature([Movie]), GenreModule, DirectorModule],
  controllers: [MovieController],
  exports: [MovieService],
  providers: [MovieService],
})
export class MovieModule {}
