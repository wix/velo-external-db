import { Firestore, WriteBatch, Query, DocumentData } from '@google-cloud/firestore'
import {
    NonEmptyAdapterAggregation,
    AdapterFilter,
    IDataProvider,
    Item,
    AdapterFilter as Filter,
    ResponseField
} from '@wix-velo/velo-external-db-types'
import FilterParser from './sql_filter_transformer'
import { asEntity } from './firestore_utils'
import { translateErrorCodes } from './sql_exception_translator'

export default class DataProvider implements IDataProvider {
    database: Firestore
    filterParser: FilterParser

    public constructor(database: Firestore, filterParser: FilterParser) {
        this.filterParser = filterParser

        this.database = database
    }

    async find(collectionName: string, filter: Filter, sort: any, skip: any, limit: any, _projection: any): Promise<Item[]> {
        const filterOperations = this.filterParser.transform(filter)
        const sortOperations = this.filterParser.orderBy(sort)

        const projection = this.filterParser.selectFieldsFor(_projection)

        const collectionRef = filterOperations.reduce((c: Query<DocumentData>, { fieldName, opStr, value }) => c.where(fieldName, opStr, value), this.database.collection(collectionName))

        const collectionRef2 = sortOperations.reduce((c, { fieldName, direction }) => c = c.orderBy(fieldName, direction), collectionRef)

        const projectedCollectionRef = projection ? collectionRef2.select(...projection) : collectionRef2

        const docs = (await projectedCollectionRef.limit(limit).offset(skip).get().catch(translateErrorCodes)).docs

        return docs.map((doc) => asEntity(doc))
    }
    
    async count(collectionName: string, filter: Filter): Promise<number> {
        const filterOperations = this.filterParser.transform(filter)

        const collectionRef = filterOperations.reduce((c:  Query<DocumentData>, { fieldName, opStr, value }) => c.where(fieldName, opStr, value), this.database.collection(collectionName))

        return (await collectionRef.get().catch(translateErrorCodes)).size
    }
    
    async insert(collectionName: string, items: Item[], _fields?: ResponseField[], upsert?: boolean): Promise<number> {

        const batch = items.reduce((b, i) =>
            upsert
                ? b.set(this.database.doc(`${collectionName}/${i._id}`), i)
                : b.create(this.database.doc(`${collectionName}/${i._id}`), i)
            , this.database.batch()
        )

        return (await batch.commit().catch(translateErrorCodes)).length
    }
     
    async update(collectionName: any, items: any[]): Promise<number> {
        const batch = items.reduce((b: { update: (arg0: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, arg1: any) => any }, i: { _id: any }) => b.update(this.database.doc(`${collectionName}/${i._id}`), i), this.database.batch())

        return (await batch.commit().catch(translateErrorCodes)).length
    }
    
    async delete(collectionName: string, itemIds: any[]) {
        const batch = itemIds.reduce((b, id) => b.delete(this.database.doc(`${collectionName}/${id}`)), this.database.batch())
        return (await batch.commit()).length
    }

    async truncate(collectionName: string) {
        const batchSize = 100
        const collectionRef = this.database.collection(collectionName)
        const query = collectionRef.orderBy('_id').limit(batchSize)
        
        return new Promise<void>((resolve, reject) => {
            this.deleteQueryBatch(query, resolve)
            .catch(reject)
        })
    
    }

    async deleteQueryBatch(query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>, resolve: () => void) {
        const snapshot = await query.get()
      
        const batchSize = snapshot.size
        if (batchSize === 0) {
          return resolve()
        }
    
        const batch = snapshot.docs.reduce((b, doc) => b.delete(doc.ref), this.database.batch()) as WriteBatch
    
        await batch.commit()
      
        process.nextTick(() => {
          this.deleteQueryBatch(query, resolve)
        })
    }

    aggregate(_collectionName: string, _filter: AdapterFilter, _aggregation: NonEmptyAdapterAggregation): Promise<Item[]> {
        throw new Error('Unsupported method')
    }
}

