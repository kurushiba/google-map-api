import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Spot } from '../spots/spot.entity';

@Entity()
@Unique(['userId', 'spotId'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  spotId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Spot)
  @JoinColumn({ name: 'spotId' })
  spot: Spot;

  @CreateDateColumn()
  createdAt: Date;
}
