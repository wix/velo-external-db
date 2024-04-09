import { Pool } from 'pg'
import { escapeIdentifier, extractIndexFromIndexQueryForCollection } from './postgres_utils'
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

        const sql = `CREATE ${unique} INDEX ${escapeIdentifier(index.name)} ON ${escapeIdentifier(collectionName)} (${index.columns.map((col: string) => `${escapeIdentifier(col)}`)})`
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

    private async getInProgressIndexesFor(collectionName: string): Promise<{ [x: string]: DomainIndex }> {
        const sql = `
        SELECT query
        FROM pg_stat_activity
        WHERE
            (query ILIKE 'CREATE INDEX%' OR query ILIKE 'CREATE UNIQUE INDEX%')
            AND (query LIKE '%${escapeIdentifier(collectionName)}(%')
            AND state = 'active'
        GROUP BY query;
        `
        this.logger?.debug('postgres-getInProgressIndexesFor', { sql })
        const { rows } = await this.pool.query(sql)
                                        .catch(err => { throw this.translateErrorCodes(err) })
        const domainIndexesForCollection = rows.map((r: { query: string }) => extractIndexFromIndexQueryForCollection(r.query))

        return domainIndexesForCollection.reduce((acc, index) => {
            acc[index.name] = index
            return acc
        }, {} as { [x: string]: DomainIndex })
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



}
