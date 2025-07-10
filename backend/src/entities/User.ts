import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { IsEmail } from 'class-validator';
import { Notification } from './Notification';

export type UserRole = 'admin' | 'manager' | 'sales' | 'accountant';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  @IsEmail()
  email!: string;

  @Column()
  password!: string; // hashed

  @Column({
    type: 'enum',
    enum: ['admin', 'manager', 'sales', 'accountant'],
    default: 'sales',
  })
  role!: UserRole;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Notification, (notification) => notification.sender)
  sentNotifications!: Notification[];

  @OneToMany(() => Notification, (notification) => notification.receiver)
  receivedNotifications!: Notification[];
}
