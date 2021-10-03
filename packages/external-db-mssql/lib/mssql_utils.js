const SqlString = require('tsqlstring')
const { InvalidQuery } = require('velo-external-db-commons').errors

const SqlServerSystemTables = ['syblicenseslog', 'sysalternates', 'sysaltusages', 'sysattributes', 'sysauditoptions',
                               'sysaudits_01', 'sysaudits_02', 'sysaudits_03', 'sysaudits_04', 'sysaudits_05', 'sysaudits_06', 'sysaudits_07', 'sysaudits_08',
                               'syscharsets', 'syscolumns', 'syscomments', 'sysconfigures', 'sysconstraints', 'syscoordinations', 'syscurconfigs', 'sysdatabases', 'sysdepends', 'sysdevices',
                               'sysencryptkeys', 'sysengines', 'sysgams', 'sysindexes', 'sysinstances', 'sysjars', 'syskeys', 'syslanguages', 'syslisteners', 'syslocks', 'sysloginroles', 'syslogins',
                               'syslogs', 'syslogshold', 'sysmessages', 'sysmonitors', 'sysobjects', 'sysoptions', 'syspartitionkeys', 'syspartitions', 'sysprocedures',
                               'sysprocesses', 'sysprotects', 'sysquerymetrics', 'sysqueryplans', 'sysreferences', 'sysremotelogins', 'sysresourcelimits', 'sysroles', 'syssecmechs', 'syssegments',
                               'sysservers', 'syssessions', 'sysslices', 'syssrvroles', 'sysstatistics', 'systabstats', 'systhresholds', 'systimeranges', 'systransactions', 'systypes',
                               'sysusages', 'sysusermessages', 'sysusers', 'sysxtypes']


const isSystemTable = collectionId => SqlServerSystemTables.includes(collectionId.trim().toLowerCase())

const escapeId = s => SqlString.escapeId(s)
const escape = s => SqlString.escape(s)
const escapeTable = s => {
    if (s && ( s.indexOf('.') !== -1 || isSystemTable(s) )) {
        throw new InvalidQuery('Illegal table name')
    }
    return escapeId(s)
}
const patchFieldName = s => `x${SqlString.escape(s).substring(1).slice(0, -1)}`
const validateLiteral = s => `@${patchFieldName(s)}`
const notConnectedPool = (pool, err) => {
    return {
        pool: {
            ...pool,
            query: async () => { throw err },
            request: async () => { throw err },
            connect: async () => { return await pool.connect() }
        },
        cleanup: () => { }
    }
}

module.exports = { escapeId, validateLiteral, patchFieldName, escape, notConnectedPool, escapeTable, isSystemTable }
