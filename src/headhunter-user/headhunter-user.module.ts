import { Module } from '@nestjs/common'
import { HeadHunterUserService } from './headhunter-user.service'
import { getConfig, HeadHunterConfig } from 'src/app.config'
import { HeadHunterUserEntity } from './entity/headhunter-user.entity'
import {  DataSource } from 'typeorm'
import { createRequestInstance } from 'src/util/request.util'

@Module({
    exports: [HeadHunterUserService],
    providers: [
        {
            useFactory: (connection: DataSource) => {
                return new HeadHunterUserService(
                    getConfig(HeadHunterConfig),
                    createRequestInstance({
                        basePath: 'https://api.hh.ru', params: { requestTimeoutMs: 2000 }
                    }),
                    connection.getRepository(HeadHunterUserEntity)
                )
            },
            provide: HeadHunterUserService,
            inject: [DataSource],
        }
    ],
})
export class HeadHunterUserModule {}
