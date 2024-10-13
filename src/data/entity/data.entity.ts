import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

export enum DataEntityKeys {
    TELEGRAM_UPDATE = 'telegram_update',
}

@Entity({ name: 'data' })
export class DataEntity {
    
    @PrimaryGeneratedColumn()
    public id!: number

    @Column('text', {unique: true})
    public key!: DataEntityKeys

    @Column('text')
    public data!: string

}