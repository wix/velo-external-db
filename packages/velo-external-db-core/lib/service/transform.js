const { v4: uuidv4 } = require('uuid')

const asWixData = e => packDates(e)

const isObject = (o) => typeof o === 'object' && o !== null


const unpackDates = item => {
    const i = clone(item)

    Object.keys(i)
          .forEach(key => {
              const value = item[key];
              if (isObject(value) && '$date' in value) {
                  i[key] = new Date(value['$date']);
              }
          })

    return i
}

const generateIdsIfNeeded = item => {
    if ('_id' in item) {
        return item
    }
    return { ...item, _id: uuidv4() }
}

const clone = o => ( { ...o } )

const packDates = item => {
    const i = clone(item)
    Object.keys(i)
          .forEach(key => {
              if (i[key] instanceof Date) {
                  i[key] = { $date: i[key].toISOString() }
              }
          })
    return i
}

module.exports = { asWixData, unpackDates, generateIdsIfNeeded }