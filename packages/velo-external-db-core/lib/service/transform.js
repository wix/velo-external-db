
const asWixData = e => packDates(e)

const isObject = (o) => typeof o === 'object' && o !== null


const unpackDates = item => {
    const i = clone(item)

    Object.keys(i)
          .forEach(key => {
              const value = item[key];
              // if (value === null) return;
    //           const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
    //
              if (isObject(value) && '$date' in value) {
                  i[key] = new Date(value['$date']);
    //           } else if (typeof value === 'string') {
    //               const re = reISO.exec(value);
    //               if (re) {
    //                   item2[key] = new Date(value);
    //               }
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