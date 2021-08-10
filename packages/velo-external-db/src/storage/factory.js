const init = (type, ...args) => {
    switch (type) {
        case 'env/mysql':
        case 'aws/mysql':
        case 'azr/mysql':
        case 'gcp/mysql':    
        case 'sql/mysql':{
            console.log(`INIT: ${type}`)
            const { init } = require('external-db-mysql')
            return init(args)
        }
        case 'env/postgres':
        case 'aws/postgres':
        case 'azr/postgres':
        case 'gcp/postgres':     
        case 'sql/postgres': {
            console.log(`INIT: ${type}`)
            const { init } = require('external-db-postgres')

            return init(args)
        }

    }
}

module.exports = { init }