import { Module } from '@nestjs/common'
import { getConfig, TelegramConfig } from 'src/app.config'
import { TelegramService } from './telegram.service'
import { DataSource } from 'typeorm'
import { DataEntity } from 'src/data/entity/data.entity'
import { createRequestInstance } from 'src/util/request.util'
import { TelegramController } from './telegram.controller'
import { HeadHunterModule } from 'src/headhunter/headhunter.module'
import { UserEntity } from 'src/user/entity/user.entity'
import { HeadHunterUserEntity } from 'src/headhunter/entity/headhunter-user.entity'

@Module({
    controllers: [TelegramController],
    exports: [TelegramService],
    imports: [HeadHunterModule],
    providers: [
        {
            useFactory: (datasource: DataSource) => {
                const config = getConfig(TelegramConfig)
                return new TelegramService(
                    createRequestInstance({
                        basePath: `https://api.telegram.org/bot${config.botToken}`
                    }),
                    datasource.getRepository(DataEntity),
                    datasource.getRepository(HeadHunterUserEntity),
                    datasource.getRepository(UserEntity)
                )
            },
            provide: TelegramService,
            inject: [DataSource],
        }
    ],
})
export class TelegramModule {}
