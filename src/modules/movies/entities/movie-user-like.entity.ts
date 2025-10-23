import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';
import { Movie } from './movie.entity';

@Entity()
export class MovieUserLike {
  @PrimaryColumn({ type: 'int8' })
  movieId: number;

  @PrimaryColumn({ type: 'int8' })
  userId: number;

  @ManyToOne(() => Movie, (movie) => movie.likedUsers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movieId' })
  movie: Relation<Movie>;

  @ManyToOne(() => User, (user) => user.likedMovies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;

  @Column()
  isLike: boolean;
}
