import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class Notification{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    type!: string

    @Column()
    message!: string

    @ManyToOne(() => User, (user) => user.sentNotifications)
    sender!: User;

    @ManyToOne(() => User, (user) => user.receivedNotifications)
    receiver!: User

    @Column({default: false})
    isRead!: boolean

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    createdAt!: Date;
}