import { promisify } from 'util'
import { Pool as MySqlPool } from 'mysql'
import { MySqlQuery } from './types'
import { DomainIndex, IIndexProvider, DomainIndexStatus } from '@wix-velo/velo-external-db-types'
import { escapeId, escapeTable } from './mysql_utils'
import { translateErrorCodes } from './sql_exception_translator'

export default class IndexProvider implements IIndexProvider{
    pool: MySqlPool
    query: MySqlQuery
    failedIndexes: {[x:string]: DomainIndex} = {}
    constructor(pool: any) {
        this.pool = pool
        this.query = promisify(this.pool.query).bind(this.pool)
    }

    async list(collectionName: string): Promise<DomainIndex[]> {
        const activeIndexes = await this.getActiveIndexesFor(collectionName)
        const inProgressIndexes = await this.getInProgressIndexesFor(collectionName)
        const indexes = {...this.failedIndexes, ...inProgressIndexes, ...activeIndexes}
        return Object.values(indexes)
    }

    async create(collectionName: string, index: DomainIndex): Promise<DomainIndex> {
        const unique = index.isUnique ? 'UNIQUE' : ''

        const createIndexPromise = this.query(`CREATE ${unique} INDEX ${escapeId(index.name)} ON ${escapeTable(collectionName)} (${index.columns.map(escapeId).join(', ')})`)
                 
        
        const status = await this.returnStatusAfterXSeconds(1, createIndexPromise, index)

        return {...index, status }
    }

    async remove(collectionName: string, indexName: string): Promise<void> {
        await this.query(`DROP INDEX ${escapeId(indexName)} ON ${escapeTable(collectionName)}`)
                  .catch( translateErrorCodes )
    }


    private async getActiveIndexesFor(collectionName: string): Promise<{[x:string]: DomainIndex}> {
        const res = await this.query(`SHOW INDEXES FROM ${escapeTable(collectionName)}`)
            .catch( translateErrorCodes )
        const indexes: {[x:string]: DomainIndex} = {}

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

    private async getInProgressIndexesFor(collectionName: string): Promise<{[x:string]: DomainIndex}> {
        const databaseName = this.pool.config.connectionConfig.database;
        const inProgressIndexes = await this.query(`SELECT * FROM information_schema.processlist WHERE db = ? AND info LIKE 'CREATE%INDEX%'`, [databaseName])
        const domainIndexesForCollection =  inProgressIndexes.map((r: any) => this.extractIndexFromQueryForCollection(collectionName, r.INFO)).filter(Boolean) as DomainIndex[];
        return domainIndexesForCollection.reduce((acc, index) => {
            acc[index.name] = index;
            return acc;
        }, {} as {[x:string]: DomainIndex});
    }

    private extractIndexFromQueryForCollection(collectionName: string, createIndexQuery: string): DomainIndex | undefined {
        const regex = /CREATE\s+(UNIQUE)?\s?INDEX\s+`(\w+)`\s+ON\s+`(\w+)`\s+\(([\w\s`,]+)\)/;
        const match = createIndexQuery.match(regex);
        if (match) {
            const [, isUnique, name, collection, columnsString] = match;
            if (collection === collectionName) {
                const columns = columnsString.replace(/`/g, '').split(',').map((column) => column.trim());
                return {
                    name,
                    columns,
                    isUnique: !!isUnique,
                    caseInsensitive: true,
                    order: 'ASC',
                    status: DomainIndexStatus.BUILDING
                };
            }
        }
        return;
    }
    
    private async returnStatusAfterXSeconds(x: number, promise: Promise<any>, index: DomainIndex): Promise<DomainIndexStatus> {
        return new Promise((resolve, reject) => {
            promise.catch((e: any) => {
                console.log('failed to create index', e);
                this.failedIndexes[index.name] = ({ ...index, status: DomainIndexStatus.FAILED })
                reject(e)
            })

            setTimeout(() => {
                resolve(DomainIndexStatus.BUILDING)
            }, x * 1000)
        })
    }
}