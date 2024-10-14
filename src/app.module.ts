import { Module } from '@nestjs/common'
import { HeadHunterUserModule } from './headhunter-user/headhunter-user.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TelegramModule } from './telegram/telegram.module'
import { UserModule } from './user/user.module'
import { HeadHunterResumeUpdateJob } from './headhunter-user/job/headhunter-resume-update.job'
import { BaseConfig, getConfig } from './app.config'

@Module({
    imports: [
        HeadHunterUserModule,
        TelegramModule,
        UserModule,
        TypeOrmModule.forRoot({
            type: 'sqlite',
            database: 'app.db',
            entities: [__dirname + '/**/entity/*.js'],
            synchronize: getConfig(BaseConfig).syncDatabase,
        }),
    ],
    controllers: [],
    providers: [HeadHunterResumeUpdateJob],
})
export class AppModule {}
