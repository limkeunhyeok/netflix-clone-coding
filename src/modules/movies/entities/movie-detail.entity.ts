import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { Movie } from './movie.entity';

@Entity()
export class MovieDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  detail: string;

  @OneToOne(() => Movie, (movie) => movie.id)
  movie: Relation<Movie>;
}
