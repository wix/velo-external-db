
export const LocalDev = () => process.env.CI === undefined || process.env.CI === 'false'

export const engineWithoutDocker = (engine: string) => (enginesWithoutDocker.includes(engine))

const enginesWithoutDocker = ['airtable', 'google-sheet']
