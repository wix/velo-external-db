import { WixDataFacade } from '../../src/web/wix_data_facade'

export const requestBodyWith = (role?: string | undefined, path?: string | undefined, authHeader?: string | undefined) => ({
    path: path || '/',
    body: {
        requestContext: {
            role: role || 'OWNER',
            settings: {
            } } },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    header(name: string) { return authHeader }
} )

export class WixDataFacadeMock implements WixDataFacade {
    publicKeys: string[]
    index: number

    constructor(...publicKeys: string[]) {
        this.publicKeys = publicKeys
        this.index = 0
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getPublicKey(externalDatabaseId: string): Promise<string> {
        const publicKeyToReturn = this.publicKeys[this.index]
        if (this.index < this.publicKeys.length-1) {
            this.index++
        }
        return Promise.resolve(publicKeyToReturn)
    }
}
