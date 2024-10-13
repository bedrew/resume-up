import { Module } from '@nestjs/common'
import { HeadHunterModule } from './headhunter/headhunter.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TelegramModule } from './telegram/telegram.module'
import { UserModule } from './user/user.module'
import { HeadHunterResumeUpdateJob } from './headhunter/job/headhunter-resume-update.job'

@Module({
    imports: [
        HeadHunterModule,
        TelegramModule,
        UserModule,
        TypeOrmModule.forRoot({
            type: 'sqlite',
            database: 'app.db',
            entities: [__dirname + '/**/entity/*.js'],
            synchronize: true,
        }),
    ],
    controllers: [],
    providers: [HeadHunterResumeUpdateJob],
})
export class AppModule {}
