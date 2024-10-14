import { Controller } from '@nestjs/common'
import { HeadHunterUserService } from 'src/headhunter-user/headhunter-user.service'
import { TelegramCommand, TelegramService } from 'src/telegram/telegram.service'
import { IntervalExecution } from 'src/decorator/interval-execution.decorator'

export class TelegramMessage {

    private messageLine: string[] = []

    constructor(message?: string[]) {
        if(message) {
            this.messageLine = message
        }
    }

    public add(message: string) {
        this.messageLine.push(message)
    }

    public create(){
        return this.messageLine.join('\n')
    }

}

@Controller()
export class TelegramController {

    constructor(
        private readonly telegramService: TelegramService,
        private readonly headHunterUserService: HeadHunterUserService
    ) {}

    @IntervalExecution()
    public async initUpdateObserver() {
        for (const item of await this.telegramService.getCommands()) {
            switch (item.command.text) { 
                case 'start' :
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
    	const message = new TelegramMessage()
        const chatUser = await this.telegramService.getChatUser(item.chatId)
        if(!chatUser.headhunterUser || !chatUser.user) {
            message.add('Не получилось найти актуальные резюме')
            message.add('Попробуйте авторизоваться /start')
            this.telegramService.sendMessage(item.chatId, message.create())
            return
        }
        const userResume = await this.headHunterUserService.getPublisedUserResume(chatUser.headhunterUser)
        if(userResume.length === 0) {
            message.add('Не получилось найти актуальные резюме')
            message.add('Для начала создайте резюме')
            this.telegramService.sendMessage(item.chatId, message.create())
            return
        }
        message.add('Мы нашли следующие резюме:\n')
        for (const [idx, oneResume] of userResume.entries()) {
            message.add(`${idx + 1}) <a href="${oneResume.alternate_url}">${oneResume.title}</a>`)
            message.add(`Следующее обновление: ${new Date(oneResume.next_publish_at).toLocaleDateString('ru-Ru', {
                day: 'numeric',           
                month: 'long',            
                year: 'numeric',          
                hour: '2-digit',          
                minute: '2-digit'       
            })}`)
        }
        message.add('\nОтключить приложение можно в <a href="hh.ru/applicant/applications">настройках</a>')
        this.telegramService.sendMessage(item.chatId, message.create())
    }

    public async sendGretting(item: TelegramCommand) {
    	const message = new TelegramMessage([
    		'Здраствуйте, мы можем автоматически обновлять дату публикации вашего резюме',
    		'Для начала работы необходимо авторизоваться по ссылке:',
    		'',
    		this.headHunterUserService.getAuthLink(item.chatId)
    	])
    	this.telegramService.sendMessage(item.chatId, message.create())
    }

}
