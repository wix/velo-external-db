
const LocalDev = () => process.env.CI === 'false'

module.exports = { LocalDev }