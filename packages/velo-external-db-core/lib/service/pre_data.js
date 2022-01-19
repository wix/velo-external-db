const { prepareForUpdate, unpackDates, prepareForInsert } = require('../converters/transform')

class PreDataService {
    constructor(filterTransformer, aggregationTransformer, queryValidator, schemaInformation) {
        this.filterTransformer = filterTransformer
        this.aggregationTransformer = aggregationTransformer
        this.queryValidator = queryValidator
        this.schemaInformation = schemaInformation
    }

    async transformAndValidateFilter(collectionName, _filter) {
        const filter = this.filterTransformer.transform(_filter)      
        const fields = await this.schemaInformation.schemaFieldsFor(collectionName)
        this.queryValidator.validateFilter(fields, filter)
        return filter
    }

    async transformAndValidateAggregation(collectionName, _aggregation) {
        const aggregation = this.aggregationTransformer.transform(_aggregation)      
        console.log(aggregation)
        console.dir(aggregation, { depth: 3 })
        // const fields = await this.schemaInformation.schemaFieldsFor(collectionName)
        // this.queryValidator.validateAggregation(fields, aggregation)
        //TODO: validate aggregation
        return aggregation
    }

    async prepareItemsForUpdate(collectionName, items) {
        const fields = await this.schemaInformation.schemaFieldsFor(collectionName)

        return items.map(i => prepareForUpdate(i, fields))
                    .map(i => unpackDates(i))

    }
    
    async prepareItemsForInsert(collectionName, items) {
        const fields = await this.schemaInformation.schemaFieldsFor(collectionName)

        return items.map(i => prepareForInsert(i, fields))
                    .map(i => unpackDates(i))
    }

}

module.exports = PreDataService