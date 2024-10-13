export const time = () => Math.round(new Date().getTime() / 1000)

export const timeoutCall = <T>({ callback, timeoutMs = 0, errorMessage }: {
    callback: ()=> Promise<any>,
    timeoutMs:number,
    errorMessage: string
}): Promise<T> => new Promise((resolve, reject) => {
        callback().then(resolve, reject)
        setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    })

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))