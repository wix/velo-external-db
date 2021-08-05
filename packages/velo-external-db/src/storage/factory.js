const init = (type, ...args) => {
    switch (type) {
        case 'sql/mysql':
        case 'gcp/sql': {
            console.log(`INIT: ${type}`)
            const { init } = require('external-db-mysql')

            return init(args)
        }
        case 'sql/postgres': {
            console.log(`INIT: ${type}`)
            const { init } = require('external-db-postgres')

            return init(args)
        }

    }
}

module.exports = { init }