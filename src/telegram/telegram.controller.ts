import { Controller } from '@nestjs/common'
import { HeadHunterService } from 'src/headhunter/headhunter.service'
import { TelegramCommand, TelegramService } from 'src/telegram/telegram.service'
import { IntervalExecution } from 'src/decorator/interval-execution.decorator'

@Controller()
export class TelegramController {

    constructor(
        private readonly telegramService: TelegramService,
        private readonly headHunterService: HeadHunterService
    ) {}

    @IntervalExecution()
    public async initUpdateObserver() {
        for (const item of await this.telegramService.getCommands()) {
            switch (item.command.type) { 
                case 'greeting' :
                    await this.sendGretting(item)
                    break
                case 'menu' :
                    await this.sendMenu(item)
                    break
                default:
                    break
            }
        }
    }

    public async sendMenu(item: TelegramCommand) {
    	const message = []
        const chatUser = await this.telegramService.getChatUser(item.chatId)
        const userResume = await this.headHunterService.getPublisedUserResume(chatUser.headhunterUser)
            .then(r=> r.entries())
        message.push('Мы нашли следующие резюме:\n')
        for (const [idx, oneResume] of userResume) {
            message.push(`${idx + 1}) <a href="${oneResume.alternate_url}">${oneResume.title}</a>`)
            message.push(`Следующее обновление: ${new Date(oneResume.next_publish_at).toLocaleDateString('ru-Ru', {
                day: 'numeric',           
                month: 'long',            
                year: 'numeric',          
                hour: '2-digit',          
                minute: '2-digit'       
            })}`)
        }
        message.push('\nОтключить приложение можно в <a href="hh.ru/applicant/applications">настройках</a>')
        this.telegramService.sendMessage(item.chatId, message.join('\n')).then(r => console.log(r.message_id))
    }

    public async sendGretting(item: TelegramCommand) {
    	const message = [
    		'Здраствуйте, мы можем автоматически обновлять дату публикации вашего резюме',
    		'Для начала работы необходимо авторизоваться по ссылке:',
    		'',
    		this.headHunterService.getAuthLink(item.chatId)
    	]
    	this.telegramService.sendMessage(item.chatId, message.join('\n')).then(r => console.log(r.message_id))
    }

}
