import { timeoutCall } from "./shared.util"

interface Params {
    headers: HeadersInit
    body?: BodyInit
    timeoutMs?: number
}

const defaultParams: Params = {
    headers: { 'Content-Type': 'application/json' },
}

type RequestConfig = {
    basePath: string, 
    params?: { requestTimeoutMs?: number }
}

export abstract class Request {

    protected request = fetch

    public config: RequestConfig = {
        basePath: '',
    }

    public constructor(config: RequestConfig) {
        this.config = config
    }

    protected abstract baseParams(params: Params): { 
        method: string, 
        headers: Params['headers'], 
        body?: Params['body'] 
    }

    protected jsonRequest<T>(url: string, params: Params): Promise<{response: Response, result: T}> {
        return this.request(url , this.baseParams(params))
            .then(async response => ({ 
                response, 
                result: await response.json(), 
                request: this.baseParams(params) 
            }))
    }

    protected textRequest(url: string, params: Params): Promise<{response: Response, result: string}> {
        return this.request(url , this.baseParams(params))
            .then(async response => ({ 
                response,
                result: await response.text(), 
                request: this.baseParams(params) 
            }))
    }

    public json<T>(url: string, params: Params = defaultParams) {
        const timeoutMs = params.timeoutMs || this.config.params?.requestTimeoutMs
        if(timeoutMs) {
            return timeoutCall<{ response: Response; result: T; }>({
                callback: this.jsonRequest.bind(this, `${this.config.basePath}/${url}`, params),
                timeoutMs,
                errorMessage: url + ' timed out after ' + timeoutMs + ' ms'
            })    
        }
        return this.jsonRequest<T>(`${this.config.basePath}/${url}`, params)
    }

    public text(url: string, params: Params = defaultParams) {
        const timeoutMs = params.timeoutMs || this.config.params?.requestTimeoutMs
        if(timeoutMs) {
            return timeoutCall<{ response: Response; result: string; }>({
                callback: this.textRequest.bind(this, `${this.config.basePath}/${url}`, params),
                timeoutMs,
                errorMessage: url + ' timed out after ' + timeoutMs + 'ms'
            })    
        }
        return this.textRequest(`${this.config.basePath}/${url}`, params)
    }
    
}

export class GET extends Request {
    protected baseParams(params: Params) {
        return { method: 'GET', headers: params.headers }
    }
}

export class POST extends Request {
    protected baseParams(params: Params) {
        return {
            method: 'POST', 
            headers: params.headers, 
            body: params.body ? JSON.stringify(params.body) : undefined 
        }
    }
}

export const createRequestInstance = (config: RequestConfig) => {
    const result = {}
    for (const oneMember of [GET, POST]) {
        const instance = new oneMember(config)
        result[oneMember.name.toLowerCase()] = instance
    }
    return result as {
        get: GET, 
        post: POST
    }
}