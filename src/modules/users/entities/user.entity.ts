import { Exclude } from 'class-transformer';
import { Role } from 'src/common/constants/role.const';
import { BaseEntity } from 'src/common/databases/base.entity';
import { MovieUserLike } from 'src/modules/movies/entities/movie-user-like.entity';
import { Movie } from 'src/modules/movies/entities/movie.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude({
    toPlainOnly: true,
  })
  password: string;

  @Column({ type: 'varchar', default: Role.MEMBER })
  role: Role;

  @Column()
  name: string;

  @OneToMany(() => Movie, (movie) => movie.creator)
  createdMovies: Relation<Movie[]>;

  @OneToMany(() => MovieUserLike, (mul) => mul.user)
  likedMovies: Relation<MovieUserLike[]>;
}
