
class GcpSecretsProvider {
    constructor() {

    }

    async getSecrets () {
        const {CLOUD_SQL_CONNECTION_NAME : cloudSqlConnectionName, USER : user, PASSWORD : password, DB : db, SECRET_KET : secretKey} = process.env;
        return {cloudSqlConnectionName, user, password,db, secretKey}
    }
}

module.exports = { GcpSecretsProvider }