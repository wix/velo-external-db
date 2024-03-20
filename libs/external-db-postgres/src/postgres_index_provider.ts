import { Pool } from 'pg'
import { escapeIdentifier } from './postgres_utils'
import { errors } from '@wix-velo/velo-external-db-commons'
import { DomainIndex, IIndexProvider, DomainIndexStatus } from '@wix-velo/velo-external-db-types'
import { ILogger } from '@wix-velo/external-db-logger'


export default class IndexProvider implements IIndexProvider {
    pool: Pool
    logger?: ILogger

    constructor(pool: any, logger?: ILogger) {
        this.pool = pool
        this.logger = logger
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

        const sql = `CREATE ${unique} INDEX ${escapeIdentifier(index.name)} ON ${escapeIdentifier(collectionName)} (${columnsToIndex.map((col: { name: string, partialString: string }) => `${escapeIdentifier(col.name)}${col.partialString}`)})`
        this.logger?.debug('postgres-create-index', { sql })
        const createIndexPromise = this.pool.query(sql)
        
        const status = await this.returnStatusAfterXSeconds(1, createIndexPromise, index)

        return { ...index, status }
    }

    async remove(collectionName: string, indexName: string): Promise<void> {
        const sql = `DROP INDEX ${escapeIdentifier(indexName)}`
        this.logger?.debug('postgres-remove-index', { sql })
        await this.pool.query(sql)
                       .catch(e => { throw this.translateErrorCodes(e) })
    }


    private async getActiveIndexesFor(collectionName: string): Promise<{ [x: string]: DomainIndex }> {
        const sql = 'SELECT * FROM pg_indexes WHERE schemaname = current_schema() AND tablename = $1'
        this.logger?.debug('postgres-get-active-indexes', { sql, parameters: [collectionName] })
        const { rows } = await this.pool.query(sql, [collectionName])
                                        .catch(err => { throw this.translateErrorCodes(err) })

        
        const indexs: { [x: string]: DomainIndex } = {} 

        // postgres return the following properties for each index:
        type IndexRow = {
            // Table name
            tablename: string
            // Index name
            indexname: string
            // Index creation command 
            indexdef: string
        }

        rows.forEach((r: IndexRow) => {
            if (!indexs[r.indexname]) {
                indexs[r.indexname] = {
                    name: r.indexname,
                    columns: [],
                    isUnique: r.indexdef.includes('UNIQUE'),
                    caseInsensitive: false,
                    order: 'ASC',
                    status: DomainIndexStatus.ACTIVE
                }
            }
            // TODO: extract this column extraction to a function
            indexs[r.indexname].columns.push(r.indexdef.split('ON')[1].split('(')[1].split(')')[0])
        })

        return indexs
    }

    private async getInProgressIndexesFor(_collectionName: string): Promise<{ [x: string]: DomainIndex }> {
        // const query = `
        // SELECT 
        // now()::TIME(0) AS "Current Time",
        // a.query,
        // p.phase,
        // round(p.blocks_done / p.blocks_total::numeric * 100, 2) AS "% Done",
        // p.blocks_total,
        // p.blocks_done,
        // p.tuples_total,
        // p.tuples_done,
        // ai.schemaname,
        // ai.relname AS tablename,
        // ai.indexrelname AS "Index Name"
        // FROM pg_stat_progress_create_index p
        // JOIN pg_stat_activity a ON p.pid = a.pid
        // LEFT JOIN pg_stat_all_indexes ai ON ai.relid = p.relid AND ai.indexrelid = p.index_relid
        // WHERE ai.relname = $1;
        // `
        // const query2 = `
        // SELECT *
        // FROM pg_stat_activity
        // WHERE state LIKE '%vacuum%' OR state LIKE '%autovacuum%';
        // `


        // const { rows } = await this.pool.query(query2)
        // .catch(err => { throw this.translateErrorCodes(err) })
        // console.dir({
        //     rows
        // }, { depth: null })
        return {}
        // const databaseName = this.pool.config.connectionConfig.database
        // const inProgressIndexes = await this.query('SELECT * FROM information_schema.processlist WHERE db = ? AND info LIKE \'CREATE%INDEX%\'', [databaseName])
        // const domainIndexesForCollection = inProgressIndexes.map((r: any) => this.extractIndexFromQueryForCollection(collectionName, r.INFO)).filter(Boolean) as DomainIndex[]
        // return domainIndexesForCollection.reduce((acc, index) => {
        //     acc[index.name] = index
        //     return acc
        // }, {} as { [x: string]: DomainIndex })
    }

    private async returnStatusAfterXSeconds(x: number, promise: Promise<any>, _index: DomainIndex): Promise<DomainIndexStatus> {
        return new Promise((resolve, _reject) => {
            promise.catch((e: any) => {
                this.logger?.error('failed to create index', this.translateErrorCodes(e))
                resolve(DomainIndexStatus.FAILED)
            })

            setTimeout(() => {
                resolve(DomainIndexStatus.BUILDING)
            }, x * 1000)
        })
    }

    private translateErrorCodes(e: any) {
        switch (e.code) {
            case '42P07':
                return new errors.IndexAlreadyExists(`Index already exists: ${e.sqlMessage}`)
            case '42703':
                return new errors.FieldDoesNotExist(`Field does not exist: ${e.sqlMessage}`)
            default:
                console.log(e)
                return new errors.UnrecognizedError(`Error while creating index: ${e} ${e.code}`)
        }
    }

    private async partialStringFor(_col: string, _collectionName: string) {
        return ''
        // const typeResp = await this.query('SELECT DATA_TYPE FROM information_schema.COLUMNS WHERE TABLE_NAME = ? AND COLUMN_NAME = ?', [collectionName, col]).catch(_e => [])
        // const type = typeResp[0]?.DATA_TYPE

        // if (this.isTextType(type)) {
        //     const lengthResp = await this.query('SELECT CHARACTER_MAXIMUM_LENGTH FROM information_schema.COLUMNS WHERE TABLE_NAME = ? AND COLUMN_NAME = ?', [collectionName, col])
        //     const length = lengthResp[0].CHARACTER_MAXIMUM_LENGTH
        //     if (length) {
        //         return length > 767 ? '(767)' : `(${length})` // 767 is the max length for a text index
        //     }
        // }
        // return ''
    }


}
