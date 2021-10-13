const minifyRecord = (record) => {
    const fields = record.fields
    if (fields._createdDate && typeof fields._createdDate === 'string') fields._createdDate = new Date(fields._createdDate)
    if (fields._updatedDate && typeof fields._updatedDate === 'string') fields._updatedDate = new Date(fields._updatedDate)
    return fields
};
module.exports = { minifyRecord }
