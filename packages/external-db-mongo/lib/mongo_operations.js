const { notThrowingTranslateErrorCodes } = require('./sql_exception_translator')
const { DbConnectionError } = require('velo-external-db-commons').errors

class DatabaseOperations {
    constructor(pool) {
        this.sql = pool
    }

    async validateConnection() {
        // try {
        //     const sql = await this.sql
        //     return await sql.query('SELECT 1')
        //                     .then(() => { return { valid: true } })
        //                     .catch((e) => { return { valid: false, error: notThrowingTranslateErrorCodes(e) } })
        // } catch (err) {
        //     switch (err.code) {
        //         case 'ELOGIN':
        //             return { valid: false, error: new DbConnectionError(`Access to database denied - probably wrong credentials, sql message: ${err.message}`) }
        //         case 'ESOCKET':
        //             return { valid: false, error: new DbConnectionError(`Access to database denied - host is unavailable, sql message: ${err.message}`) }
        //     }
        //     throw new Error(`Unrecognized error: ${err.message}`)
        // }
    }
}

module.exports = DatabaseOperations
