minifyRecord = (record) => {
    return {
        id: record.id,
        fields: record.fields,
    };
};
module.exports = { minifyRecord }
