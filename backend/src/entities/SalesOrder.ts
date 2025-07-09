import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User';
import { SalesOrderItem } from './SalesOrderItem';

@Entity()
export class SalesOrder {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  salesRep!: User;

  @ManyToOne(() => User, { nullable: true })
  approvedBy!: User | null;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status!: 'pending' | 'approved' | 'rejected';

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt!: Date | null;

  @OneToMany(() => SalesOrderItem, (item) => item.salesOrder, { cascade: true })
  items!: SalesOrderItem[];

  @Column({ default: false })
    isPaid!: boolean;

    @Column({ type: 'timestamp', nullable: true })
    paidAt!: Date | null;

}
