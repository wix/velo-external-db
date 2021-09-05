const { Timestamp } = require('@google-cloud/firestore')
const { SystemFields } = require('velo-external-db-commons')

class DataProvider {
    constructor(database, filterParser) {
        this.filterParser = filterParser

        this.database = database
    }

    async find(collectionName, filter, sort, skip, limit) {
        const filterOperations = this.filterParser.transform(filter)
        const sortOperations = this.filterParser.orderBy(sort)

        let collectionRef = this.database.collection(collectionName)

        filterOperations.forEach(filterOp => collectionRef.where(filterOp.fieldName,filterOp.opStr,filterOp.value))

        sortOperations.forEach(sortOp => collectionRef = collectionRef.orderBy(sortOp.fieldName,sortOp.direction))


        const docs = (await collectionRef.limit(limit).get()).docs

        return docs.map(doc => this.asEntity(doc))
    }
    
    async count(collectionName, filter) {
        const filterOperations = this.filterParser.transform(filter)
        const collectionRef = this.database.collection(collectionName)

        filterOperations.forEach( filterOp => collectionRef.where(filterOp.fieldName,filterOp.opStr,filterOp.value))

        return (await collectionRef.get()).size
    }
    
    async insert(collectionName, items) {
        const batch = this.database.batch()

        items.forEach( item => batch.set(this.database.doc(`${collectionName}/${item._id}`),item));

        return (await batch.commit()).length
    }
 
    fixDates(value) {
        if (value instanceof Timestamp) {
            return value.toDate()
        }
        return value
    }
    
    asEntity(docEntity) {
        const doc = docEntity.data()
        return Object.keys(doc)
        .reduce(function (obj, key) {
            return { ...obj, [key]: this.fixDates(doc[key]) }
        }.bind(this), {})
    }
    
    async update(collectionName, items) {
        const item = items[0]
        const batch = this.database.batch()
        const systemFieldNames = SystemFields.map(f => f.name)
        const updateFields = Object.keys(item).filter( k => !systemFieldNames.includes(k) )
    
        if (updateFields.length === 0) {
            return 0
        }

        items.forEach( item => 
            batch.update(this.database.doc(`${collectionName}/${item._id}`),item));

        return (await batch.commit()).length
    }
    
    async delete(collectionName, itemIds) {
        const batch = this.database.batch()
        itemIds.forEach( itemId => batch.delete(this.database.doc(`${collectionName}/${itemId}`)) )

        return (await batch.commit()).length
    }

    async truncate(collectionName) {
        const snapshot = await this.database.collection(collectionName).get()
        
        if(snapshot.size === 0){
            return 0
        }

        const itemIds =  snapshot.docs.map((doc) => (doc.data())._id );
        return await this.delete(collectionName, itemIds)
    }

}

module.exports = DataProvider