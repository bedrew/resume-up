import qs from 'qs'
import { HeadHunterConfig } from "src/app.config" 
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { HeadHunterUserEntity } from "./entity/headhunter-user.entity"
import { Repository } from "typeorm"
import { createRequestInstance } from "src/util/request.util"
import { HeadHunterUserProvider } from './provider/headhunter-user.provider'
import { time } from 'src/util/shared.util'
  
@Injectable()
export class HeadHunterUserService {

    public constructor(
        private config: HeadHunterConfig,
        private request: ReturnType<typeof createRequestInstance>,
        @InjectRepository(HeadHunterUserEntity) 
            private headhunterUserEntityRepository: Repository<HeadHunterUserEntity>,
    ) {}

    public getAuthLink(chatId: number) {
        return 'https://hh.ru/oauth/authorize?' + qs.stringify({
            client_id: this.config.clientId,
            response_type: 'code',
            redirect_uri: this.config.redirectUrl + '?chatId=' + chatId,
        })
    }

    public async getUser(userId: number) {
        return this.headhunterUserEntityRepository.findOneBy({ removed: false, id: userId })
    }

    public async removeUser(user: HeadHunterUserEntity) {
        return this.headhunterUserEntityRepository.update({ id: user.id },{ removed: true })
    }

    public async createUser(code: string, telergamChatId: number) {

        const provider = this.createProvider()
        const result = await provider.createToken(code, telergamChatId)
        const tokenInfo = await provider.tokenInfo(result.access_token)

        if(tokenInfo.auth_type !== 'applicant') { 
            throw new Error('Invalid auth type')
        }

        let user = await this.headhunterUserEntityRepository.findOneBy({ externalId: Number(tokenInfo.id) })

        if(!user) {
            user = this.headhunterUserEntityRepository.create({
                accessToken: result.access_token,
                refreshToken: result.refresh_token,
                tsAccessTokenExpire: Math.round(Date.now() / 1000 + Number(result.expires_in)),
                externalId: Number(tokenInfo.id),
            })
        }

        return this.headhunterUserEntityRepository.save({ ...user, removed: false })
    }

    private createProvider(user?: HeadHunterUserEntity) {
        return new HeadHunterUserProvider(this.config, this.request, user)
    }

    public updateResumePublishDate(user: HeadHunterUserEntity, resumeId: string) {
        return this.createProvider(user).updateResumePublishDate(resumeId)
    }

    public async updateToken(user: HeadHunterUserEntity) {
        const provider = this.createProvider(user)
        if((time() - user.tsAccessTokenExpire) > 0) {
            const {expires_in, access_token, refresh_token} =  await provider.refreshToken(user.refreshToken)
            return this.headhunterUserEntityRepository.save({
                ...user, ...{
                    tsAccessTokenExpire: Math.round(Date.now() / 1000 + Number(expires_in)),
                    accessToken: access_token,
                    refreshToken: refresh_token,
                }
            })
        }
        return user
    }

    public getPublisedUserResume(user: HeadHunterUserEntity) {
        return this.createProvider(user).getResume()
            .then(r => r.items.filter(item => item.status.id === "published"))
    }

}