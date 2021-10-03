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

module.exports = { blockUntil }