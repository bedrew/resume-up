import { Injectable } from '@nestjs/common'
import { DataEntity, DataEntityKeys } from 'src/data/entity/data.entity'
import { HeadHunterUserEntity } from 'src/headhunter-user/entity/headhunter-user.entity'
import { UserEntity } from 'src/user/entity/user.entity'
import { createRequestInstance } from 'src/util/request.util'
import { timeoutCall } from 'src/util/shared.util'
import { Repository } from 'typeorm'

export interface TelegramEntry {
    update_id: number
    message?: {
        chat?: { type: 'private', id: number }
        text: string
    }
    callback_query?: any
    chat_join_request?: any
    my_chat_member?: any
    inline_query?: {
        from: any
        id: string
        offset: string
        query: string
    }
}

export interface TelegramCommand {
    chatId: number;
    command: {
        text: string;
        description: string;
    };
}

const TELEGRAM_COMMAND = [
    { command: 'start', description: 'Авторизация' },
    { command: 'menu', description: 'Меню' },
]

@Injectable()
export class TelegramService {

    public constructor(
        private request: ReturnType<typeof createRequestInstance>,
        private dataEntityRepository: Repository<DataEntity>,
        private headhunterUserEntityRepository: Repository<HeadHunterUserEntity>,
        private userEntityRepository: Repository<UserEntity>,
    ) {}

    public async getChatUser(chatId: number) {
        const user = await this.userEntityRepository.findOneBy({ 
            telegramChatId: chatId, removed: false
        })
        if(!user) {
            return { user: null, headhunterUser: null }
        }
        const headhunterUser = await this.headhunterUserEntityRepository.findOneBy({ 
            id: user.headHunterUserId, removed: false 
        })
        return { user, headhunterUser }
    }

    public async getUpdates() {
        const dataEntity = await this.dataEntityRepository.findOneBy({ key: DataEntityKeys.TELEGRAM_UPDATE })
        const queryParams: {offset?: number, timeout?: number} = {}

        if (dataEntity) {
            queryParams.offset = Number(dataEntity.data) + 1
            queryParams.timeout = 10
        }

        const updates: TelegramEntry[] = await timeoutCall({
            callback: this.query.bind(this, 'getUpdates', queryParams),
            timeoutMs: 20 * 1000,
            errorMessage: 'telegram_connection_reset'
        })

        if(!updates || updates.length === 0) {
            return []
        }

        await this.dataEntityRepository.upsert({
            key: DataEntityKeys.TELEGRAM_UPDATE,
            data: updates.sort((a, b) => b.update_id - a.update_id)[0].update_id.toString()
        }, ['key'])
        
        return updates
    }

    public async getCommands(): Promise<TelegramCommand[]> {
        return this.getUpdates().then(update => {
            const result: { chatId: number, command: {text: string, description: string} }[] = []
            for (const oneUpdate of update) {
                const message = oneUpdate.message
                if(!message|| !message.chat) {
                    continue
                } 
                if(message.chat.type !== 'private') {
                    continue
                }
                const updateCommand = TELEGRAM_COMMAND
                    .find(item => '/' + item.command === message.text)
                if(!updateCommand) {
                    continue
                }
                result.push({
                    chatId: message.chat.id,
                    command: { text: updateCommand.command, description: updateCommand.description }
                })
            }
            return result
        })
    }

    public async sendMessage(chatId: number, text: string ) { 
        return this.query<{message_id: number}>('sendMessage', {
            chat_id: chatId,
            text: text,
            parse_mode: 'html',
        })
    }

    public setCommands() {
        return this.query('setMyCommands', { commands: TELEGRAM_COMMAND })
    }

    public async query<T>(url: string, params: any = {}) {
        return this.request.post.json<{result: T}>(`${url}`, {
            headers: {'content-type': 'application/json'},
            body: params
        }).then(r => {
            return r.result.result
        })
    }

}
