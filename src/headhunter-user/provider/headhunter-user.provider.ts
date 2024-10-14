import qs from 'qs'
import { HeadHunterConfig } from "src/app.config" 
import { createRequestInstance } from "src/util/request.util"
import { Applicant, Resume, TokenUpdateResult } from '../headhunter-user.types'
import { HeadHunterUserEntity } from '../entity/headhunter-user.entity'
  

export class HeadHunterUserProvider {

    public constructor(
        private config: HeadHunterConfig,
        private request: ReturnType<typeof createRequestInstance>,
        private headhunterUser?: HeadHunterUserEntity
    ) {}

    public createToken(code: string, telergamChatId: number) {
        const params = {
            grant_type: "authorization_code",
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
            redirect_uri: this.config.redirectUrl + '?chatId=' + telergamChatId,
            code
        }
        return this.request.post.json<TokenUpdateResult>('token?' + qs.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'HH-User-Agent': this.config.userAgent,
            },
        }).then(r => r.result)
    }
    
    public updateResumePublishDate(resumeId: string, token?: string) {
        return this.request.post.text('resumes/' + resumeId + '/publish', {
            headers: {
                'HH-User-Agent': this.config.userAgent,
                'Authorization': `Bearer ${token || this.headhunterUser?.accessToken}`,
                'Content-Type': 'application/json',
            },
        })
    }

    public refreshToken(refreshToken: string) {
        const params = {
            grant_type: "refresh_token",
            refresh_token: refreshToken,
        }
        return this.request.post.json<TokenUpdateResult>('token?' + qs.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'HH-User-Agent': this.config.userAgent,
            },
        }).then(r => r.result)
    }

    public getResume(token?: string) {
        // todo: page iteration
        return this.request.get.json<Resume>('resumes/mine?per_page=50', {
            headers: {
                'HH-User-Agent': this.config.userAgent,
                'Authorization': `Bearer ${token || this.headhunterUser?.accessToken}`,
                'Content-Type': 'application/json',
            },
        }).then(r => {
            return r.result
        })
    }

    public tokenInfo(token?: string) {
        return this.request.get.json<Applicant>('me', {
            headers: {
                'HH-User-Agent': this.config.userAgent,
                'Authorization': `Bearer ${token || this.headhunterUser?.accessToken}`,
                'Content-Type': 'application/json',
            },
        }).then(r => {
            return r.result
        })
    }

}