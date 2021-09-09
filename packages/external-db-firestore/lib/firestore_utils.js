const { Timestamp } = require('@google-cloud/firestore')


const fixDates = (value) => {
    if (value instanceof Timestamp) {
        return value.toDate()
    }
    return value
}

const deleteQueryBatch = async (db, query, resolve) => {
    const snapshot = await query.get()
  
    const batchSize = snapshot.size
    if (batchSize === 0) {
      return resolve()
    }

    const batch = snapshot.docs.reduce((b, doc) => b.delete(doc.ref),db.batch())

    await batch.commit()
  
    process.nextTick(() => {
      deleteQueryBatch(db, query, resolve)
    })
}



module.exports = { fixDates, deleteQueryBatch }
