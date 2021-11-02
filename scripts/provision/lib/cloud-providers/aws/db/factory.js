const clientFor = engine => {
    switch (engine) {
        case 'mysql':
            return require('./mysql_support')
        case 'postgres':
            return require('./postgres_support')
    }
}

const portFor = engine => {
    switch (engine) {
        case 'mysql':
            return 3306
        case 'postgres':
            return 5432
    }
}

module.exports = { clientFor, portFor }