
const asWixData = e => packDates(e)

const unpackDates = item => {
    Object.keys(item)
          .map(key => {
              const value = item[key];
              if (value === null) return;

              const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;

              if (typeof value === 'object' && '$date' in value) {
                  item[key] = new Date(value['$date']);
              }

              if (typeof value === 'string') {
                  const re = reISO.exec(value);
                  if (re) {
                      item[key] = new Date(value);
                  }
              }
          })

    return item
}

const packDates = item => {
    Object.keys(item)
          .map(key => {
              if (item[key] instanceof Date) {
                  item[key] = { $date: item[key] }
              }
          })

return item
}
/*
 */

module.exports = { asWixData, unpackDates }