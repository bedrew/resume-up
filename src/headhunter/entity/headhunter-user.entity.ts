import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'headhunter_user' })
export class HeadHunterUserEntity {

    @PrimaryGeneratedColumn()
    public id!: number

    @Column('integer', { name: 'external_id' })
    public externalId!: number

    @Column('varchar', { name: 'access_token' })
    public accessToken!: string

    @Column('varchar', { name: 'refresh_token' })
    public refreshToken!: string

    @Column('integer', { name: 'ts_access_token_expire' })
    public tsAccessTokenExprire!: number

    @Column('boolean')
    public removed = false

}