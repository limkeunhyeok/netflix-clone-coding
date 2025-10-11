import { BaseEntity } from 'src/common/databases/base.entity';
import { Director } from 'src/modules/directors/entities/director.entity';
import { Genre } from 'src/modules/genres/entities/genre.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

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
}
