
const LocalDev = () => process.env.CI === undefined || process.env.CI === 'false'

const engineWithoutDocker = (engine) => (enginesWithoutDocker.includes(engine))

const enginesWithoutDocker = ['airtable']

module.exports = { LocalDev, engineWithoutDocker }