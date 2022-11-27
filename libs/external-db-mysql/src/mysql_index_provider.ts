import { promisify } from 'util'
import { Pool as MySqlPool } from 'mysql'
import { MySqlQuery } from './types'
import { DomainIndex, IIndexProvider } from '@wix-velo/velo-external-db-types'
import { escapeId, escapeTable } from './mysql_utils'
import { translateErrorCodes } from './sql_exception_translator'

export default class IndexProvider implements IIndexProvider{
    pool: MySqlPool
    query: MySqlQuery
    constructor(pool: any) {
        this.pool = pool
        this.query = promisify(this.pool.query).bind(this.pool)
    }

    async list(collectionName: string): Promise<DomainIndex[]> {
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
                    order: 'ASC'
                }
            }
            indexes[r.Key_name].columns.push(r.Column_name)
        })
        return Object.values(indexes)
    }

    async create(collectionName: string, index: DomainIndex): Promise<DomainIndex> {
        const unique = index.isUnique ? 'UNIQUE' : ''
        //TODO: support caseSensitive? 
        await this.query(`CREATE ${unique} INDEX ${escapeId(index.name)} ON ${escapeTable(collectionName)} (${index.columns.map(escapeId).join(', ')})`)
                  .catch( translateErrorCodes )
        return index
    }

    async remove(collectionName: string, indexName: string): Promise<void> {
        await this.query(`DROP INDEX ${escapeId(indexName)} ON ${escapeTable(collectionName)}`)
                  .catch( translateErrorCodes )
    }
}