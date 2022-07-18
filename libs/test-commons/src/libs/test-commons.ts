export const Uninitialized: any = null

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const shouldNotRunOn = (impl: string[], current: string) => !impl.includes(current)

export const shouldRunOnlyOn = (impl: string[], current: string) => impl.includes(current)

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
export const testIfSupportedOperationsIncludes = (supportedOperations: string[], operation: string[]): any => operation.every((o: any) => supportedOperations.includes(o)) ? test : test.skip 

export const testSupportedOperations = (supportedOperations: string[], operationTable: string[][]): string[][] => {
    return operationTable.filter(i => !i[2] || supportedOperations.includes(i[2]))
}


