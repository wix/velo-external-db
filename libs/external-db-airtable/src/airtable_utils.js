const minifyAndFixDates = record => {
    if (record._createdDate && typeof record._createdDate === 'string') record._createdDate = new Date(record._createdDate)
    if (record._updatedDate && typeof record._updatedDate === 'string') record._updatedDate = new Date(record._updatedDate)
    return record
}
const DEFAULT_MAX_RECORDS = 100

const EmptySort = { sort: [] }

module.exports = { minifyAndFixDates, DEFAULT_MAX_RECORDS, EmptySort }
