const { notThrowingTranslateErrorCodes } = require('./sql_exception_translator')

class DatabaseOperations {
    constructor(database) {
        this.database = database;
    }
    //
    // async validateConnection() {
    //     return await this.database.run({ sql: 'SELECT 1' })
    //                      .then(() => { return { valid: true } })
    //                      .catch((e) => { return { valid: false, error: notThrowingTranslateErrorCodes(e) } })
    // }
    // config() {
    //     // const config = Object.assign({}, this.database.options)
    //     // if (config.password) config.password = '*********'
    //     // return config
    //     // console.log({ projectId: this.database.parent.projectId, instanceId: this.database.id})
    //
    //     return {
    //         host: 'localhost',
    //         user: 'test-user',
    //         database: this.database.id,
    //         port: 5432,
    //         max: 10,
    //     }
    //     // return { /*projectId: this.database.parent.projectId, */instanceId: this.database.id}
    // }
}

module.exports = DatabaseOperations