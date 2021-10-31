const clientFor = engine => {
    switch (engine) {
        case 'mysql':
            return require('./mysql_support')
    }
}

module.exports = { clientFor }