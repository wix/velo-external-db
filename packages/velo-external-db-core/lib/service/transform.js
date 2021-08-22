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

const clone = o => Object.assign({}, o)

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

module.exports = { asWixData, unpackDates }