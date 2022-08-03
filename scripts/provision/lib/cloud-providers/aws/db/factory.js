const clientFor = engine => {
    switch (engine) {
        case 'mysql':
            return require('./mysql_support')
        case 'postgres':
            return require('./postgres_support')
        case 'mssql':
            return require('./mssql_support')
    }
}

const portFor = engine => {
    switch (engine) {
        case 'mysql':
            return 3306
        case 'postgres':
            return 5432
        case 'mssql':
            return 1443
    }
}

const createCmdPatchFor = (engine) => {
    switch (engine) {
        case 'mssql':
            return { Engine: 'sqlserver-ex', DBInstanceClass: 'db.t3.small', LicenseModel: 'license-included' }
        default:
            return { }

    }
}

module.exports = { clientFor, portFor, createCmdPatchFor }
