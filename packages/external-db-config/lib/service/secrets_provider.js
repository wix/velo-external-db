
class SecretsProvider {
    constructor() {

    }

    async getSecrets () {
        const {host, user, password,db, secretKey} = process.env;
        return {host, user, password,db, secretKey}
    }
}

module.exports = { SecretsProvider }