const { asEntity } = require('./firestore_utils')
const { SystemFields } = require('velo-external-db-commons')

class DataProvider {
    constructor(database, filterParser) {
        this.filterParser = filterParser

        this.database = database
    }

    async find(collectionName, filter, sort, skip, limit) {
        const filterOperations = this.filterParser.transform(filter)
        const sortOperations = this.filterParser.orderBy(sort)

        const collectionRef = filterOperations.reduce((c, { fieldName, opStr, value }) => c.where(fieldName, opStr, value), this.database.collection(collectionName))

        const collectionRef2 = sortOperations.reduce((c, { fieldName, direction }) => c = c.orderBy(fieldName, direction), collectionRef)

        const docs = (await collectionRef2.limit(limit).offset(skip).get()).docs

        return docs.map(doc => asEntity(doc))
    }
    
    async count(collectionName, filter) {
        const filterOperations = this.filterParser.transform(filter)

        const collectionRef = filterOperations.reduce((c, { fieldName, opStr, value }) => c.where(fieldName, opStr, value), this.database.collection(collectionName))

        return (await collectionRef.get()).size
    }
    
    async insert(collectionName, items) {
        const batch = items.reduce((b, i) => b.set(this.database.doc(`${collectionName}/${i._id}`), i), this.database.batch())

        return (await batch.commit()).length
    }
     
    async update(collectionName, items) {
        const batch = items.reduce((b, i) => b.update(this.database.doc(`${collectionName}/${i._id}`), i), this.database.batch())

        return (await batch.commit()).length
    }
    
    async delete(collectionName, itemIds) {
        const batch = itemIds.reduce((b, id) => b.delete(this.database.doc(`${collectionName}/${id}`)), this.database.batch())

        return (await batch.commit()).length
    }

    async truncate(collectionName) {
        const batchSize = 100
        const collectionRef = await this.database.collection(collectionName)
        const query = collectionRef.orderBy('_id').limit(batchSize)

        return new Promise((resolve, reject) =>{
            this.deleteQueryBatch(query, resolve).catch(reject)
        })
    
    }

    async deleteQueryBatch(query, resolve) {
        const snapshot = await query.get()
      
        const batchSize = snapshot.size
        if (batchSize === 0) {
          return resolve()
        }
    
        const batch = snapshot.docs.reduce((b, doc) => b.delete(doc.ref), this.database.batch())
    
        await batch.commit()
      
        process.nextTick(() => {
          this.deleteQueryBatch(query, resolve)
        })
    }
      
}

module.exports = DataProvider