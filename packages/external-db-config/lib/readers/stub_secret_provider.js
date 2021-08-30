
class StubSecretProvider {
    constructor() {
    }

    readConfig() {
        return {}
    }

    validate() {
        return { missingRequiredSecretsKeys: [] }
    }
}

module.exports = StubSecretProvider