const minifyRecord = (record) => {
    const fields = record.fields
    fields._createdDate = { $date: fields._createdDate }
    fields._updatedDate = { $date: fields._updatedDate }
    return fields
};
module.exports = { minifyRecord }
