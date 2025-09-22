import { Exclude } from 'class-transformer';
import { Role } from 'src/common/constants/role.const';
import { BaseEntity } from 'src/common/databases/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ enum: Role, default: Role.MEMBER })
  role: Role;
}
