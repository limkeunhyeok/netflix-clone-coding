import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectorModule } from '../directors/director.module';
import { GenreModule } from '../genres/genre.module';
import { UserModule } from '../users/user.module';
import { MovieDetail } from './entities/movie-detail.entity';
import { MovieUserLike } from './entities/movie-user-like.entity';
import { Movie } from './entities/movie.entity';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Movie, MovieDetail, MovieUserLike]),
    GenreModule,
    DirectorModule,
    UserModule,
  ],
  controllers: [MovieController],
  exports: [MovieService],
  providers: [MovieService],
})
export class MovieModule {}
