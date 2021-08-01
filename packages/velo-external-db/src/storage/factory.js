const init = (type, host, user, password, db, cloudSqlConnectionName) => {
    switch (type) {
        case 'sql/mysql':
        case 'gcp/sql': {
            const { init } = require('external-db-mysql')

            return init(type, host, user, password, db, cloudSqlConnectionName)
        }
        case 'sql/postgres': {
            const { init } = require('external-db-postgres')

            return init(type, host, user, password, db)
        }

    }
}

module.exports = { init }