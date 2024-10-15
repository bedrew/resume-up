import { Injectable, Logger } from "@nestjs/common"
import { HeadHunterUserService } from "../headhunter-user.service"
import { TelegramService } from "src/telegram/telegram.service"
import { UserService } from "src/user/user.service"
import { IntervalExecution } from "src/decorator/interval-execution.decorator"
import { time } from "src/util/shared.util"
import { TelegramMessage } from "src/telegram/telegram.controller"
import { UserEntity } from "src/user/entity/user.entity"

@Injectable()
export class HeadHunterResumeUpdateJob {

    constructor(
        private headHunterUserService: HeadHunterUserService,
        private telegramService: TelegramService,
        private userService: UserService
    ) {}

    public logger = new Logger(this.constructor.name)
    
    @IntervalExecution({ sleepMs: 10000, timeoutMs: 0 })
    public async startJob() {
        for (const oneUser of await this.userService.getAllUser()) {
            try {
                await this.updateUserResume(oneUser)
            } catch (error) {
                this.logger.error('Update error on user ' + oneUser.id + ' info below')
                console.log(error)
            }
        }
    }

    public async updateUserResume(oneUser: UserEntity) {
        let headhunterUser = await this.headHunterUserService.getUser(oneUser.headHunterUserId)
        if(!headhunterUser) {
            await this.userService.removeUser(oneUser)
            return
        }
        if((time() - oneUser.tsUpdate) > 60 * 60 * 24) {
            await this.userService.removeUser(oneUser)
            await this.headHunterUserService.removeUser(headhunterUser)
            this.telegramService.sendMessage(oneUser.telegramChatId, new TelegramMessage([
                'Публикация резюме была приостановлена',
                'Вы можете повторно включить обновление используя команду /start'
            ]).create())
            return
        }
        headhunterUser = await this.headHunterUserService.updateToken(headhunterUser)
        const resume = await this.headHunterUserService.getPublisedUserResume(headhunterUser)
        for (const oneResume of resume.filter(item => item.can_publish_or_update === true)) {
            try {
                const result = await this.headHunterUserService.updateResumePublishDate(headhunterUser, oneResume.id)
                if(result.response.status === 204) {
                    this.telegramService.sendMessage(oneUser.telegramChatId, new TelegramMessage([
                        `Резюме ${oneResume.title} было обновленно`,
                    ]).create()) 
                }
            } catch (error) {
                console.log(error)
            }
        }
    }
   
}