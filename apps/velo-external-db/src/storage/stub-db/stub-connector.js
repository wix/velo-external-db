const { DbConnector } = require('velo-external-db-commons')
const init = require('./init')
const { StubConfigValidator } = require('./providers')

class StubConnector extends DbConnector {
    constructor(type) {
        super(StubConfigValidator, init)
        this.type = type
    }
}


const stubFactory = async(type, config) => {
    const connector = new StubConnector(type)
    const { connection, cleanup, ...providers } = await connector.initialize(type, config)
    return { connector, connection, providers, cleanup }
} 


module.exports = { StubConnector, stubFactory }