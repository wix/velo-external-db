const { UnsupportedDatabase } = require('velo-external-db-commons').errors

class StubDataProvider {}

class StubDatabaseOperations {
    constructor(type) {
        this.type = type
    }

    validateConnection() {
        return { valid: false, error: new UnsupportedDatabase(`Unknown db type: ${this.type}`) }
    }
}

class StubSchemaProvider {
    constructor() {
    }

    list() {
        return {}
    }
}

module.exports = { StubDataProvider, StubDatabaseOperations, StubSchemaProvider }