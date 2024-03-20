import { promisify } from 'util'
import { errors } from '@wix-velo/velo-external-db-commons'
import { DomainIndex, IIndexProvider, DomainIndexStatus } from '@wix-velo/velo-external-db-types'
import { ILogger } from '@wix-velo/external-db-logger'
import { Pool as MySqlPool } from 'mysql'
import { MySqlQuery } from './types'
import { escapeId, escapeTable } from './mysql_utils'

export default class IndexProvider implements IIndexProvider {
    pool: MySqlPool
    query: MySqlQuery
    logger?: ILogger
    constructor(pool: any, logger?: ILogger) {
        this.pool = pool
        this.logger = logger
        this.query = promisify(this.pool.query).bind(this.pool)
    }

    async list(collectionName: string): Promise<DomainIndex[]> {
        const activeIndexes = await this.getActiveIndexesFor(collectionName)
        const inProgressIndexes = await this.getInProgressIndexesFor(collectionName)
        const indexes = { ...inProgressIndexes, ...activeIndexes }
        return Object.values(indexes)
    }

    async create(collectionName: string, index: DomainIndex): Promise<DomainIndex> {
        const unique = index.isUnique ? 'UNIQUE' : ''

        const columnsToIndex = await Promise.all(index.columns.map(async(col: string) => {
            return {
                name: col,
                partialString: await this.partialStringFor(col, collectionName)
            }
        }))

        const sql = `CREATE ${unique} INDEX ${escapeId(index.name)} ON ${escapeTable(collectionName)} (${columnsToIndex.map((col: { name: string, partialString: string }) => `${escapeId(col.name)}${col.partialString}`)})`
        this.logger?.debug('mysql-create-index', { sql })
        const createIndexPromise = this.query(sql)
        
        const status = await this.returnStatusAfterXSeconds(1, createIndexPromise)        
                
        return { ...index, status }
    }

    async remove(collectionName: string, indexName: string): Promise<void> {
        const sql = `DROP INDEX ${escapeId(indexName)} ON ${escapeTable(collectionName)}`
        this.logger?.debug('mysql-remove-index', { sql })
        await this.query(sql)
            .catch(e => { throw this.translateErrorCodes(e) })
    }


    private async getActiveIndexesFor(collectionName: string): Promise<{ [x: string]: DomainIndex }> {
        const sql = `SHOW INDEXES FROM ${escapeTable(collectionName)}`
        this.logger?.debug('mysql-getActiveIndexesFor', { sql })
        const res = await this.query(sql)
                              .catch(this.translateErrorCodes)
        const indexes: { [x: string]: DomainIndex } = {}

        res.forEach((r: { Key_name: string; Column_name: string; Non_unique: number }) => {
            if (!indexes[r.Key_name]) {
                indexes[r.Key_name] = {
                    name: r.Key_name,
                    columns: [],
                    isUnique: r.Non_unique === 0,
                    caseInsensitive: true, // by default true but can be changed by the user - need to check.
                    order: 'ASC',
                    status: DomainIndexStatus.ACTIVE
                }
            }
            indexes[r.Key_name].columns.push(r.Column_name)
        })
        return indexes
    }

    private async getInProgressIndexesFor(collectionName: string): Promise<{ [x: string]: DomainIndex }> {
        const databaseName = this.pool.config.connectionConfig.database
        const sql = 'SELECT * FROM information_schema.processlist WHERE db = ? AND info LIKE \'CREATE%INDEX%\''
        this.logger?.debug('mysql-getInProgressIndexesFor', { sql, parameters: databaseName })
        const inProgressIndexes = await this.query('SELECT * FROM information_schema.processlist WHERE db = ? AND info LIKE \'CREATE%INDEX%\'', [databaseName])
        const domainIndexesForCollection = inProgressIndexes.map((r: any) => this.extractIndexFromQueryForCollection(collectionName, r.INFO)).filter(Boolean) as DomainIndex[]
        return domainIndexesForCollection.reduce((acc, index) => {
            acc[index.name] = index
            return acc
        }, {} as { [x: string]: DomainIndex })
    }

    private extractIndexFromQueryForCollection(collectionName: string, createIndexQuery: string): DomainIndex | undefined {
        const regex = /CREATE\s+(UNIQUE)?\s?INDEX\s+`(\w+)`\s+ON\s+`(\w+)`\s+\(([\w\s`,]+)\)/
        const match = createIndexQuery.match(regex)
        if (match) {
            const [, isUnique, name, collection, columnsString] = match
            if (collection === collectionName) {
                const columns = columnsString.replace(/`/g, '').split(',').map((column) => column.trim())
                return {
                    name,
                    columns,
                    isUnique: !!isUnique,
                    caseInsensitive: true,
                    order: 'ASC',
                    status: DomainIndexStatus.BUILDING
                }
            }
        }
        return
    }

    private async returnStatusAfterXSeconds(x: number, promise: Promise<any>): Promise<DomainIndexStatus> {
        return new Promise((resolve, _reject) => {
            promise.catch((e: any) => {
                this.logger?.error('failed to create index', e)
                resolve(DomainIndexStatus.FAILED)
            })

            setTimeout(() => {
                resolve(DomainIndexStatus.BUILDING)
            }, x * 1000)
        })
    }

    private translateErrorCodes(e: any) {
        switch (e.code) {
            case 'ER_DUP_INDEX':
            case 'ER_DUP_KEYNAME':
                return new errors.IndexAlreadyExists(`Index already exists: ${e.sqlMessage}`)
            case 'ER_DUP_ENTRY':
                return new errors.ItemAlreadyExists(`Duplicate entry in unique index: ${e.sqlMessage}`)
            case 'ER_CANT_DROP_FIELD_OR_KEY':
                return new errors.IndexDoesNotExist(`Index does not exist: ${e.sqlMessage}`)
            default:
                return new errors.UnrecognizedError(`Error while creating index: ${e.sqlMessage}`)
        }
    }

    private isTextType(type: string) {
        return ['char', 'varchar', 'text', 'tinytext', 'mediumtext', 'longtext'].includes(type)
    }

    private async partialStringFor(col: string, collectionName: string) {
        const typeResp = await this.query('SELECT DATA_TYPE FROM information_schema.COLUMNS WHERE TABLE_NAME = ? AND COLUMN_NAME = ?', [collectionName, col]).catch(_e => [])
        const type = typeResp[0]?.DATA_TYPE

        if (this.isTextType(type)) {
            const lengthResp = await this.query('SELECT CHARACTER_MAXIMUM_LENGTH FROM information_schema.COLUMNS WHERE TABLE_NAME = ? AND COLUMN_NAME = ?', [collectionName, col])
            const length = lengthResp[0].CHARACTER_MAXIMUM_LENGTH
            if (length) {
                return length > 767 ? '(767)' : `(${length})` // 767 is the max length for a text index
            }
        }
        return ''
    }
}
