export const Uninitialized = null

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const shouldNotRunOn = (impl: string[], current: string) => !impl.includes(current)

export const shouldRunOnlyOn = (impl: string[], current: string) => impl.includes(current)

//@ts-ignore
export const testIfSupportedOperationsIncludes = (supportedOperations: string[], operation: string[]): any => operation.every((o: any) => supportedOperations.includes(o)) ? test : test.skip 
