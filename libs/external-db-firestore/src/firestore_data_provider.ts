import { Firestore, WriteBatch } from '@google-cloud/firestore'
import { AdapterAggregation, AdapterFilter, IDataProvider, Item } from '@wix-velo/velo-external-db-types'
import FilterParser from './sql_filter_transformer'
import { asEntity } from './firestore_utils'

export default class DataProvider implements IDataProvider {
    database: Firestore
    filterParser: FilterParser

    public constructor(database: Firestore, filterParser: FilterParser) {
        this.filterParser = filterParser

        this.database = database
    }

    async find(collectionName: string, filter: any, sort: any, skip: any, limit: any, _projection: any) {
        const filterOperations = this.filterParser.transform(filter)
        const sortOperations = this.filterParser.orderBy(sort)

        const projection = this.filterParser.selectFieldsFor(_projection)
    
        const collectionRef = filterOperations.reduce((c: { where: (arg0: any, arg1: any, arg2: any) => any }, { fieldName, opStr, value }: any) => c.where(fieldName, opStr, value), this.database.collection(collectionName))

        const collectionRef2 = sortOperations.reduce((c, { fieldName, direction }) => c = c.orderBy(fieldName, direction), collectionRef)

        const projectedCollectionRef = projection ? collectionRef2.select(...projection) : collectionRef2

        const docs = (await projectedCollectionRef.limit(limit).offset(skip).get()).docs

        return docs.map((doc: any) => asEntity(doc))
    }
    
    async count(collectionName: string, filter: any) {
        const filterOperations = this.filterParser.transform(filter)

        const collectionRef = filterOperations.reduce((c: { where: (arg0: any, arg1: any, arg2: any) => any }, { fieldName, opStr, value }: any) => c.where(fieldName, opStr, value), this.database.collection(collectionName))

        return (await collectionRef.get()).size
    }
    
    async insert(collectionName: any, items: any[]) {
        const batch = items.reduce((b: { set: (arg0: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, arg1: any) => any }, i: { _id: any }) => b.set(this.database.doc(`${collectionName}/${i._id}`), i), this.database.batch())

        return (await batch.commit()).length
    }
     
    async update(collectionName: any, items: any[]) {
        const batch = items.reduce((b: { update: (arg0: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, arg1: any) => any }, i: { _id: any }) => b.update(this.database.doc(`${collectionName}/${i._id}`), i), this.database.batch())

        return (await batch.commit()).length
    }
    
    async delete(collectionName: string, itemIds: any[]) {
        const batch = itemIds.reduce((b: { delete: (arg0: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>) => any }, id: any) => b.delete(this.database.doc(`${collectionName}/${id}`)), this.database.batch())

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

    aggregate(_collectionName: string, _filter: AdapterFilter, _aggregation: AdapterAggregation): Promise<Item[]> {
        throw new Error('Unsupported method')
    }
}

