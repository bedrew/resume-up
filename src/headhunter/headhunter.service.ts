import qs from 'qs'
import { HeadHunterConfig } from "src/app.config" 
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { HeadHunterUserEntity } from "./entity/headhunter-user.entity"
import { Repository } from "typeorm"
import { createRequestInstance } from "src/util/request.util"
import { HeadHunterUserProvider } from './provider/headhunter-user.provider'
  
@Injectable()
export class HeadHunterService {

    public constructor(
        protected config: HeadHunterConfig,
        protected request: ReturnType<typeof createRequestInstance>,
        @InjectRepository(HeadHunterUserEntity) private headhunterUserEntity: Repository<HeadHunterUserEntity>,
    ) {}

    public getAuthLink(chatId: number) {
        return 'https://hh.ru/oauth/authorize?' + qs.stringify({
            client_id: this.config.clientId,
            response_type: 'code',
            redirect_uri: this.config.redirectUrl + '?chatId=' + chatId,
        })
    }

    public async getUser(userId: number) {
        return this.headhunterUserEntity.findOneBy({ removed: false, id: userId })
    }

    public async createUser(code: string, telergamChatId: number) {

        const provider = this.createProvider()
        const result = await provider.createToken(code, telergamChatId)
        const tokenInfo = await provider.tokenInfo(result.access_token)

        if(tokenInfo.auth_type !== 'applicant') { 
            throw new Error('Invalid auth type')
        }

        let user = await this.headhunterUserEntity.findOneBy({ externalId: Number(tokenInfo.id) })

        if(!user) {
            user = this.headhunterUserEntity.create({
                accessToken: result.access_token,
                refreshToken: result.refresh_token,
                tsAccessTokenExprire: Math.round(Date.now() / 1000 + Number(result.expires_in)),
                externalId: Number(tokenInfo.id),
            })
        }

        return this.headhunterUserEntity.save({ ...user, removed: false })
    }

    private createProvider(user?: HeadHunterUserEntity) {
        return new HeadHunterUserProvider(this.config, this.request, user)
    }

    public updateResumePublishDate(user: HeadHunterUserEntity, resumeId: string) {
        return this.createProvider(user).updateResumePublishDate(resumeId)
    }

    public getPublisedUserResume(user: HeadHunterUserEntity) {
        return this.createProvider(user).getResume().then(r=> r.items.filter(i => i.can_publish_or_update === true))
    }

}