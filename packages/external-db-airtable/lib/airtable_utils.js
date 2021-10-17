const minifyRecord = (record) => {
    const fields = record.fields
    if (fields._createdDate && typeof fields._createdDate === 'string') fields._createdDate = new Date(fields._createdDate)
    if (fields._updatedDate && typeof fields._updatedDate === 'string') fields._updatedDate = new Date(fields._updatedDate)
    return fields
};


const bulkCreateExpr = (items) => {
    return items.reduce((pV, cV) => {
        pV.push({ fields: { ...cV } });
        return pV; 
      }, []);
}

module.exports = { minifyRecord, bulkCreateExpr }
