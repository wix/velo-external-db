
const LocalDev = () => process.env.CI === undefined || process.env.CI === 'false'

module.exports = { LocalDev }