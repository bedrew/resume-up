import { sleep, timeoutCall } from "../util/shared.util"
import { Logger, LoggerService } from '@nestjs/common'

type Args = { 
    timeoutMs: number,
    sleepMs: number, 
    logger: LoggerService
}

export function IntervalExecution(
    { timeoutMs, sleepMs, logger }: Args = { 
        timeoutMs: 0, sleepMs: 1000, logger: new Logger('IntervalExecution')
    }
): MethodDecorator {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value
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