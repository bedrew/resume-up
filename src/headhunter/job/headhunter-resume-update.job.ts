import { Injectable, Logger } from "@nestjs/common"
import { HeadHunterService } from "../headhunter.service"
import { TelegramService } from "src/telegram/telegram.service"
import { UserService } from "src/user/user.service"
import { IntervalExecution } from "src/decorator/interval-execution.decorator"
import { timeoutCall } from "src/util/shared.util"

@Injectable()
export class HeadHunterResumeUpdateJob {

    constructor(
        protected headHunterService: HeadHunterService,
        protected telegramService: TelegramService,
        protected userService: UserService
    ) {}
    
    @IntervalExecution({sleepMs: 5000, timeoutMs: 0, logger: new Logger('IntervalExecution')})
    public async startJob() {
        for (const oneUser of await this.userService.getAllUser()) {
            const headhunterUser = await this.headHunterService.getUser(oneUser.headHunterUserId)
            if(!headhunterUser) {
                throw new Error("HeadHunter user not found")
            }
            const resume = await this.headHunterService.getPublisedUserResume(headhunterUser)
            console.log(resume)
            for (const oneResume of resume) {
                try {
                    await timeoutCall({
                        callback: this.headHunterService.updateResumePublishDate.bind(
                            this.headHunterService, headhunterUser, oneResume.id
                        ),
                        timeoutMs: 1000,
                        errorMessage: 'updateResumePublishDate timed out'
                    })    
                } catch (error) {
                    console.log(error)
                }
            }

        }


    }
   
}