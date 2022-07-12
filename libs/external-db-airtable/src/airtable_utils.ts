export const minifyAndFixDates = (record: { _createdDate: string | number | Date; _updatedDate: string | number | Date }) => {
    if (record._createdDate && typeof record._createdDate === 'string') record._createdDate = new Date(record._createdDate)
    if (record._updatedDate && typeof record._updatedDate === 'string') record._updatedDate = new Date(record._updatedDate)
    return record
}
export const DEFAULT_MAX_RECORDS = 100

export const EmptySort = { sort: [] }
