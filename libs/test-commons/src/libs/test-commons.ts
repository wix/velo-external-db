import { isObject } from '@wix-velo/velo-external-db-commons'
import { SchemaOperations } from '@wix-velo/velo-external-db-types'

export const Uninitialized: any = null

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const shouldNotRunOn = (impl: string[], current: string) => !impl.includes(current)

export const shouldRunOnlyOn = (impl: string[], current: string) => impl.includes(current)

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
export const testIfSupportedOperationsIncludes = (supportedOperations: SchemaOperations[], operation: string[]): any => {
    const x = 2
    x
    return operation.every((o: any) => supportedOperations.includes(o)) ? test : test.skip
}


export const testSupportedOperations = (supportedOperations: SchemaOperations[], arrayTable: any[][]): string[][] => {
    return arrayTable.filter(i => {
        const lastItem = i[i.length - 1]
        return !isObject(lastItem) || lastItem['neededOperations'].every((i: any) => supportedOperations.includes(i))
    })
}

export const streamToArray = async(stream: any) => {

    return new Promise((resolve, reject) => {
        const arr: any[] = []
    
        stream.on('data', (data: any) => {
            arr.push(JSON.parse(data.toString()))
        })
        
        stream.on('end', () => {
            resolve(arr)
        })

        stream.on('error', (err: Error) => reject(err))
        
    })
}
