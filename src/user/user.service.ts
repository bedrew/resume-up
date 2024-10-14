import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserEntity } from './entity/user.entity'
import { HeadHunterUserService } from 'src/headhunter-user/headhunter-user.service'
import { time } from 'src/util/shared.util'
import { TelegramService } from 'src/telegram/telegram.service'

@Injectable()
export class UserService {

    public constructor(
        @InjectRepository(UserEntity) private userEntityRepository: Repository<UserEntity>,
        private readonly headHunterUserService: HeadHunterUserService,
        private readonly telegramService: TelegramService,
    ) {}

    public getAllUser() {
        return this.userEntityRepository.findBy({ removed: false })
    }

    public removeUser(user: UserEntity) {
        return this.userEntityRepository.update({ id: user.id },{ removed: true })
    }

    public async createUser(code: string, telergamChatId: number) {
        const headhunterUser = await this.headHunterUserService.createUser(code, telergamChatId)
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
