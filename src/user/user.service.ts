import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserEntity } from './entity/user.entity'
import { HeadHunterService } from 'src/headhunter/headhunter.service'
import { time } from 'src/util/shared.util'
import { TelegramService } from 'src/telegram/telegram.service'

@Injectable()
export class UserService {

    public constructor(
        @InjectRepository(UserEntity) private userEntityRepository: Repository<UserEntity>,
        private readonly headHunterService: HeadHunterService,
        private readonly telegramService: TelegramService,
    ) {}

    public getAllUser() {
        return this.userEntityRepository.findBy({ removed: false })
    }

    public async createUser(code: string, telergamChatId: number) {
        const headhunterUser = await this.headHunterService.createUser(code, telergamChatId)
        let user = await this.userEntityRepository.findOneBy({
            headHunterUserId: headhunterUser.id, telegramChatId: Number(telergamChatId)
        })
        if (!user) { 
            user = this.userEntityRepository.create({
                headHunterUserId: headhunterUser.id,
                telegramChatId: Number(telergamChatId),
                tsCreate: time()
            }) 
        }
        await this.userEntityRepository.save({ ...user, removed: false })
        this.telegramService.sendMessage(
            telergamChatId, ['Вы успешно авторизовались.', 'Для продолжения нажмите /menu'].join('\n')
        )
    }
    

}
