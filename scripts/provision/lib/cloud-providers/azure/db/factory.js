const clientFor = engine => {
    switch (engine) {
        case 'mysql':
            return require('./mysql_support')
        case 'postgres':
            return require ('./postgres_support')
    }
}

module.exports = { clientFor }