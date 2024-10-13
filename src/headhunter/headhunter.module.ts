import { Module } from '@nestjs/common'
import { HeadHunterService } from './headhunter.service'
import { getConfig, HeadHunterConfig } from 'src/app.config'
import { HeadHunterUserEntity } from './entity/headhunter-user.entity'
import {  DataSource } from 'typeorm'
import { createRequestInstance } from 'src/util/request.util'

@Module({
    exports: [HeadHunterService],
    providers: [
        {
            useFactory: (connection: DataSource) => {
                return new HeadHunterService(
                    getConfig(HeadHunterConfig),
                    createRequestInstance({
                        basePath: 'https://api.hh.ru'
                    }),
                    connection.getRepository(HeadHunterUserEntity)
                )
            },
            provide: HeadHunterService,
            inject: [DataSource],
        }
    ],
})
export class HeadHunterModule {}
