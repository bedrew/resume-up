import { sleep, timeoutCall } from "../util/shared.util"
import { Logger } from '@nestjs/common'

type Args = { 
    timeoutMs: number,
    sleepMs: number, 
}

export function IntervalExecution(
    { timeoutMs, sleepMs }: Args = {  timeoutMs: 0, sleepMs: 1000 }
): MethodDecorator {
    return function (target: any, _: string | symbol, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value
        const logger = new Logger('IntervalExecution')
        descriptor.value = async function (...args: any[]) {
            logger.log(target.constructor.name + ':' + originalMethod.name + ' initialized')
            while (true) {
                try {
                    if(sleepMs) {
                        await sleep(sleepMs)
                    }
                    if(timeoutMs) {
                        return await timeoutCall({
                            callback: originalMethod.bind(this, args),
                            timeoutMs,
                            errorMessage: originalMethod.name + ' timed out after ' + timeoutMs + 'ms'
                        })    
                    } 
                    await originalMethod.apply(this, args)
                } catch (e) { 
                    logger.error(originalMethod.name + ' error below')
                    console.log(e)
                }
            }
        }
        return descriptor
    }
}