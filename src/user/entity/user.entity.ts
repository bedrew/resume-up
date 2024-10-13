import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity({ name: 'user' })
export class UserEntity {

    @PrimaryGeneratedColumn()
    public id!: number

    @Column('integer', { name: 'head_hunter_user_id' })
    public headHunterUserId!: number

    @Column('integer', { name: 'telegram_chat_id' })
    public telegramChatId!: number

    @Column('integer', { name: 'ts_create' })
    public tsCreate!: number

    @Column('boolean')
    public removed = false

}