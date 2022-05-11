const resetHooks = (externalDbRouter) => externalDbRouter.reloadHooks()

const writeRequestBodyWith = (collectionName, items) => ({
    collectionName, items, item: items[0], itemId: items[0]._id, itemIds: items.map(item => item._id)
})

const readRequestBodyWith = (collectionName, items) => ({
    collectionName, filter: {}, processingStep: { _id: { field1: '$_id' } }, postFilteringStep: {}, itemId: items[0]._id, skip: 0, limit: 10
})

module.exports = { writeRequestBodyWith, readRequestBodyWith, resetHooks }