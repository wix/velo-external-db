const clientFor = engine => {
    switch (engine) {
        case 'mysql':
            return require('./db/mysql_support')
        case 'postgres':
            return require('./db/postgres_support')
    }
}

module.exports = { clientFor }