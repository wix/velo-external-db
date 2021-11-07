
const minifyAndFixDates = record => {
    const fields = record.fields
    if (fields._createdDate && typeof fields._createdDate === 'string') fields._createdDate = new Date(fields._createdDate)
    if (fields._updatedDate && typeof fields._updatedDate === 'string') fields._updatedDate = new Date(fields._updatedDate)
    return fields
}
const DEFAULT_MAX_RECORDS = 100

module.exports = { minifyAndFixDates, DEFAULT_MAX_RECORDS }
