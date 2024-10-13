interface Params {
    headers: HeadersInit
    body?: BodyInit
}

const defaultParams: Params = {
    headers: { 'Content-Type': 'application/json' },
}

export abstract class Request {

    public basePath = ''
    protected request = fetch

    public constructor({ basePath }: {basePath?: string}) {
        if(basePath) {
            this.basePath = basePath
        }
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
        return this.jsonRequest<T>(`${this.basePath}/${url}`, params)
    }

    public text(url: string, params: Params = defaultParams) {
        return this.textRequest(`${this.basePath}/${url}`, params)
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

export const createRequestInstance = (config: {basePath: string}) => {
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