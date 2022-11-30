import { errors } from '@wix-velo/velo-external-db-commons'
const { UnauthorizedError } = errors
import axios from 'axios'
import { decodeBase64 } from '../utils/base64_utils'

type PublicKeyResponse = {
    publicKey: string;
};

export interface IWixDataFacade {
    getPublicKey(externalDatabaseId: string): Promise<string>
}

export class WixDataFacade implements IWixDataFacade {
    baseUrl: string

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl
    }

    async getPublicKey(externalDatabaseId: string): Promise<string> {
        const url = `${this.baseUrl}/v1/external-databases/${externalDatabaseId}`
        const { data, status } = await axios.get<PublicKeyResponse>(url, {
            headers: {
                Accept: 'application/json',
            },
        })
        if (status !== 200) {
            throw new UnauthorizedError(`failed to get public key: status ${status}`)
        }
        return decodeBase64(data.publicKey)
    }
}
