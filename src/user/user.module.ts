import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { HeadHunterModule } from 'src/headhunter/headhunter.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from './entity/user.entity'
import { UserController } from './user.controller'
import { TelegramModule } from 'src/telegram/telegram.module'

@Module({
    exports: [UserService],
    providers: [
        UserService,
    ],
    controllers: [UserController],
    imports: [HeadHunterModule, TypeOrmModule.forFeature([UserEntity]), TelegramModule]
})
export class UserModule {}
