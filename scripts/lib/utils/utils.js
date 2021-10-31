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


module.exports = { blockUntil, randomWithPrefix }