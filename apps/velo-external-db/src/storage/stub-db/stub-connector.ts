import { DbConnector } from '@wix-velo/velo-external-db-commons'
import init from './init'
import { StubConfigValidator } from './providers'

class StubConnector extends DbConnector {
    constructor(type: string) {
        // @ts-ignore - todo: fix this
        super(StubConfigValidator, init)
        this.type = type
    }
}


const stubFactory = async(type: string, config: any) => {
    const connector = new StubConnector(type)
    const { connection, cleanup, ...providers } = await connector.initialize(type, config)
    return { connector, connection, providers, cleanup }
} 


module.exports = { StubConnector, stubFactory }