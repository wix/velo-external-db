const SqlString = require('tsqlstring') 
import { errors } from '@wix-velo/velo-external-db-commons'
import { Counter } from './sql_filter_transformer'
const { InvalidQuery } = errors

const SqlServerSystemTables = ['syblicenseslog', 'sysalternates', 'sysaltusages', 'sysattributes', 'sysauditoptions',
                               'sysaudits_01', 'sysaudits_02', 'sysaudits_03', 'sysaudits_04', 'sysaudits_05', 'sysaudits_06', 'sysaudits_07', 'sysaudits_08',
                               'syscharsets', 'syscolumns', 'syscomments', 'sysconfigures', 'sysconstraints', 'syscoordinations', 'syscurconfigs', 'sysdatabases', 'sysdepends', 'sysdevices',
                               'sysencryptkeys', 'sysengines', 'sysgams', 'sysindexes', 'sysinstances', 'sysjars', 'syskeys', 'syslanguages', 'syslisteners', 'syslocks', 'sysloginroles', 'syslogins',
                               'syslogs', 'syslogshold', 'sysmessages', 'sysmonitors', 'sysobjects', 'sysoptions', 'syspartitionkeys', 'syspartitions', 'sysprocedures',
                               'sysprocesses', 'sysprotects', 'sysquerymetrics', 'sysqueryplans', 'sysreferences', 'sysremotelogins', 'sysresourcelimits', 'sysroles', 'syssecmechs', 'syssegments',
                               'sysservers', 'syssessions', 'sysslices', 'syssrvroles', 'sysstatistics', 'systabstats', 'systhresholds', 'systimeranges', 'systransactions', 'systypes',
                               'sysusages', 'sysusermessages', 'sysusers', 'sysxtypes']


export const isSystemTable = (collectionId: string) => SqlServerSystemTables.includes(collectionId.trim().toLowerCase())

export const escapeId = (s: string) => s === '*' ? '*' : SqlString.escapeId(s)
export const escape = (s: any) => SqlString.escape(s)

export const escapeTable = (s: string) => {
    if (s && ( s.indexOf('.') !== -1 || isSystemTable(s) )) {
        throw new InvalidQuery('Illegal table name')
    }
    return escapeId(s)
}

export const patchFieldName = (s: any, i?: number) => i ? `x${SqlString.escape(s).substring(1).slice(0, -1)}${i}` : SqlString.escape(s).substring(1).slice(0, -1)
export const validateLiteral = (s: any, i?: number) => `@${patchFieldName(s, i)}`

export const validateLiteralWithCounter = (s: any, counter: Counter) => validateLiteral(`${s}${counter.valueCounter++}`)

export const patchFieldNameWithCounter = (s: any, counter: Counter) => patchFieldName(`${s}${counter.paramCounter++}`)

export const notConnectedPool = (pool: { connect: () => any }, err: any) => {
    return {
        pool: {
            ...pool,
            query: async() => { throw err },
            request: async() => { throw err },
            connect: async() => { return await pool.connect() }
        },
        cleanup: () => { }
    }
}
