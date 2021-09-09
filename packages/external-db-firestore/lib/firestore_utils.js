const { Timestamp } = require('@google-cloud/firestore')


const fixDates = (value) => {
    if (value instanceof Timestamp) {
        return value.toDate()
    }
    return value
}

const asEntity = (docEntity) => {
  const doc = docEntity.data()
  return Object.keys(doc)
  .reduce(function(obj, key) {
      return { ...obj, [key]: fixDates(doc[key]) }
  }.bind(this), {})
}

module.exports = { fixDates, asEntity }
