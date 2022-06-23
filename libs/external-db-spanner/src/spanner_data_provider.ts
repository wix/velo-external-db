import { recordSetToObj, escapeId, patchFieldName, unpatchFieldName, patchFloat, extractFloatFields } from './spanner_utils'
import { translateErrorCodes } from './sql_exception_translator'
import { ISpannerFilterParser } from './sql_filter_transformer'
import { IDataProvider, AdapterFilter as Filter, AdapterAggregation as Aggregation, Item} from '@wix-velo/velo-external-db-types'
import { Database as SpannerDb } from '@google-cloud/spanner'


export default class DataProvider implements IDataProvider {
    filterParser: ISpannerFilterParser
    database: SpannerDb
    constructor(database: any, filterParser: any) {
        this.filterParser = filterParser

        this.database = database
    }

    async find(collectionName: string, filter: Filter, sort: any, skip: any, limit: any, projection: any): Promise <Item[]> {
        const { filterExpr, parameters } = this.filterParser.transform(filter)
        const { sortExpr } = this.filterParser.orderBy(sort)
        const projectionExpr = this.filterParser.selectFieldsFor(projection)

        const query = {
            sql: `SELECT ${projectionExpr} FROM ${escapeId(collectionName)} ${filterExpr} ${sortExpr} LIMIT @limit OFFSET @skip`,
            params: {
                skip: skip,
                limit: limit,
                ...parameters
            },
        }

        const [rows] = await this.database.run(query)
        return recordSetToObj(rows).map( this.asEntity.bind(this) )
    }

    async count(collectionName: string, filter: Filter): Promise <number> {
        const { filterExpr, parameters } = this.filterParser.transform(filter)
        const query = {
            sql: `SELECT COUNT(*) AS num FROM ${escapeId(collectionName)} ${filterExpr}`.trim(),
            params: parameters,
        }

        const [rows] = await this.database.run(query)
        const objs = recordSetToObj(rows).map( this.asEntity.bind(this) )

        return objs[0]['num']
    }

    async insert(collectionName: string, items: Item[], fields: any): Promise <number> {
        const floatFields = extractFloatFields(fields)
        await this.database.table(collectionName)
                            .insert(
                                (items.map((item: any) => patchFloat(item, floatFields)))
                                        .map(this.asDBEntity.bind(this))
                            ).catch(translateErrorCodes)
        return items.length
    }

    asDBEntity(item: Item) {
        return Object.keys(item)
                     .reduce((obj, key) => {
                         return { ...obj, [patchFieldName(key)]: item[key] }
                     }, {})
    }

    fixDates(value: any) {
        if (value instanceof Date) {
            // todo: fix this hack !!!
            const date = value.toISOString()
            const date2 = `${date.substring(0, date.lastIndexOf('.') + 4)}${date.slice(-1)}`
            return new Date(date2)
        }
        return value

    }

    asEntity(dbEntity: Item) {
        return Object.keys(dbEntity)
                     .reduce(function(this: any, obj: Item, key: string) {
                         return { ...obj, [unpatchFieldName(key)]: this.fixDates(dbEntity[key]) }
                     }.bind(this), {})
    }

    async update(collectionName: string, items: Item[], _fields: any): Promise <number> {
        const floatFields = extractFloatFields(_fields || [])
        await this.database.table(collectionName)
                           .update(
                               (items.map((item: any) => patchFloat(item, floatFields)))
                                     .map(this.asDBEntity.bind(this))
                           )
        return items.length
    }

    async delete(collectionName: string, itemIds: string[]): Promise <number> {
        await this.database.table(collectionName)
                           .deleteRows(itemIds)
        return itemIds.length
    }

    async truncate(collectionName: string): Promise <void> {
        // todo: properly implement this
        const query = {
            sql: `SELECT * FROM ${escapeId(collectionName)} LIMIT @limit OFFSET @skip`,
            params: {
                skip: 0,
                limit: 1000,
            },
        }

        const [rows] = await this.database.run(query)
        const itemIds = recordSetToObj(rows).map( this.asEntity.bind(this) ).map((e: { [x:string]: any }) => e['_id'])

        await this.delete(collectionName, itemIds)
    }

    async aggregate(collectionName: string, filter: Filter, aggregation: Aggregation): Promise <Item[]> {
        const { filterExpr: whereFilterExpr, parameters: whereParameters } = this.filterParser.transform(filter)

        const { fieldsStatement, groupByColumns, havingFilter, parameters } = this.filterParser.parseAggregation(aggregation)
        const query = {
            sql: `SELECT ${fieldsStatement} FROM ${escapeId(collectionName)} ${whereFilterExpr} GROUP BY ${groupByColumns.map(column => escapeId(column)).join(', ')} ${havingFilter}`,
            params: { ...whereParameters, ...parameters },
        }

        const [rows] = await this.database.run(query)
        return recordSetToObj(rows).map( this.asEntity.bind(this) )
    }

}
