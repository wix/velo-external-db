const { waitFor } = require('poll-until-promise')

const blockUntil = async f => waitFor(
    async () => {
        const response = await f()

        if (!response) {
            throw new Error('try again')
        }
    }, {
        interval: 100,
        timeout: 10 * 60 * 1000,
        message: 'Waiting for time to pass :)',
    }
)

const randomInt = () => Math.floor(Math.random() * 10000)
const randomWithPrefix = prefix => `${prefix}-${randomInt()}`

const dateTo3339Format = (date) => {
    const pad = n => n < 10 ? '0' + n : n
    return date.getUTCFullYear() + '-'
        + pad(date.getUTCMonth() + 1) + '-'
        + pad(date.getUTCDate()) + 'T'
        + pad(date.getUTCHours()) + ':'
        + pad(date.getUTCMinutes()) + ':'
        + pad(date.getUTCSeconds()) + 'Z'
}

const xHoursFromNow = ( hours ) => {
    const date = new Date()
    date.setHours( date.getHours() + hours )
    return date
}

module.exports = { blockUntil, randomWithPrefix, dateTo3339Format, xHoursFromNow }