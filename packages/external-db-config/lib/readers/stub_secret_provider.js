
class StubSecretProvider {
    constructor() {
    }

    getSecrets() {
        return {}
    }

    validate() {
        return { missingRequiredSecretsKeys: [] }
    }
}

module.exports = StubSecretProvider