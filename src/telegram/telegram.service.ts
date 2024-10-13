import { Injectable } from '@nestjs/common'
import { TelegramConfig } from 'src/app.config'
import { DataEntity, DataEntityKeys } from 'src/data/entity/data.entity'
import { HeadHunterUserEntity } from 'src/headhunter/entity/headhunter-user.entity'
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
        type: string;
    };
}

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
        const commands = [
            { text: "/start", type: 'login' },
            { text: "/menu", type: 'menu' }
        ]
        return this.getUpdates().then(update => {
            const result: { chatId: number, command: { text: string, type: string } }[] = []
            for (const oneUpdate of update) {
                if(!oneUpdate.message || !oneUpdate.message.chat) {
                    continue
                } 
                if(oneUpdate.message.chat.type !== 'private') {
                    continue
                }
                result.push({
                    chatId: oneUpdate.message.chat.id,
                    command: commands.find(item => item.text === oneUpdate.message.text) 
                })
            }
            return result.filter(item => item.command)
        })
    }

    public async sendMessage(chatId: number, text: string ) { 
        return this.query<{message_id: number}>('sendMessage', {
            chat_id: chatId,
            text: text,
            parse_mode: 'html',
        })
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
