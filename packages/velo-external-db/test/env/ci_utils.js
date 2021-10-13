
const LocalDev = () => process.env.CI !== true

module.exports = { LocalDev }