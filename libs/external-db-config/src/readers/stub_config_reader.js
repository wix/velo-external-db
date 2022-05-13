
class StubConfigReader {
    constructor() {
    }

    readConfig() {
        return {}
    }

    validate() {
        return { missingRequiredSecretsKeys: [] }
    }
}

module.exports = StubConfigReader