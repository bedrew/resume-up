import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { Logger } from '@nestjs/common'
import { BaseConfig, getConfig } from './app.config'
import { TelegramController } from './telegram/telegram.controller'
import { HeadHunterResumeUpdateJob } from './headhunter-user/job/headhunter-resume-update.job'

(async function bootstrap() {

    const logger = new Logger('Bootstrap')
    const config = getConfig(BaseConfig)
    const app = await NestFactory.create(AppModule)

    await app.listen(config.port, () => {
        logger.log('listing port ' + config.port)
    })

    app.get(TelegramController).initUpdateObserver()
    app.get(HeadHunterResumeUpdateJob).startJob()

})()