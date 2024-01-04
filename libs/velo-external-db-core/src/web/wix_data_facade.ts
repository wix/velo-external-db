import { errors } from '@wix-velo/velo-external-db-commons'
const { UnauthorizedError } = errors
import axios from 'axios'

type PublicKeyResponse = {
    publicKeys: {
        id: string,
        publicKeyPem: string
    }[];
};

export type PublicKeyMap = { [key: string]: string }

export interface IWixDataFacade {
    getPublicKeys(externalDatabaseId: string): Promise<PublicKeyMap>
}

export class WixDataFacade implements IWixDataFacade {
    baseUrl: string

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl
    }

    async getPublicKeys(externalDatabaseId: string): Promise<PublicKeyMap> {
        const url = `${this.baseUrl}/v1/external-databases/${externalDatabaseId}/public-keys`
        const { data, status } = await axios.get<PublicKeyResponse>(url, {
            headers: {
                Accept: 'application/json',
            },
        })
        if (status !== 200) {
            throw new UnauthorizedError(`failed to get public keys: status ${status}`)
        }
        return data.publicKeys.reduce((m: PublicKeyMap, { id, publicKeyPem }) => {
            m[id] = publicKeyPem
            return m
        }, {})
    }
}
