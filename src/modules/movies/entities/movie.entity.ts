import { BaseEntity } from 'src/common/databases/base.entity';
import { Director } from 'src/modules/directors/entities/director.entity';
import { Genre } from 'src/modules/genres/entities/genre.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { MovieDetail } from './movie-detail.entity';

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

  @OneToOne(() => MovieDetail, (movieDetail) => movieDetail.id, {
    cascade: true,
  })
  @JoinColumn()
  detail: Relation<MovieDetail>;
}
