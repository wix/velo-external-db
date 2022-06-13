const Uninitialized = null

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const shouldNotRunOn = (impl: string[], current: string) => !impl.includes(current)

const shouldRunOnlyOn = (impl: string[], current: string) => impl.includes(current)

//@ts-ignore
const testIfSupportedOperationsIncludes = (supportedOperations: string[], operation: string[]): any => operation.every((o: any) => supportedOperations.includes(o)) ? test : test.skip 

export { shouldNotRunOn, shouldRunOnlyOn, sleep, Uninitialized, testIfSupportedOperationsIncludes }