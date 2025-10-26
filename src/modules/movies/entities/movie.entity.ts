import { BaseEntity } from 'src/common/databases/base.entity';
import { Director } from 'src/modules/directors/entities/director.entity';
import { Genre } from 'src/modules/genres/entities/genre.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { MovieDetail } from './movie-detail.entity';
import { MovieUserLike } from './movie-user-like.entity';

@Entity()
export class Movie extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string;

  @ManyToMany(() => Genre, (genre) => genre.movies)
  @JoinTable()
  genres: Genre[];

  @ManyToOne(() => Director, (director) => director.id)
  director: Relation<Director>;

  @OneToOne(() => MovieDetail, (movieDetail) => movieDetail.movie, {
    cascade: true,
  })
  @JoinColumn()
  detail: Relation<MovieDetail>;

  @ManyToOne(() => User, (user) => user.createdMovies)
  creator: Relation<User>;

  @Column({
    default: 0,
  })
  likeCount: number;

  @Column({
    default: 0,
  })
  dislikeCount: number;

  @OneToMany(() => MovieUserLike, (mul) => mul.movie)
  likedUsers: Relation<MovieUserLike[]>;
}
