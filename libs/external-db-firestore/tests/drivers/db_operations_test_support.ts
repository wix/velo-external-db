import init from '../../src/connection_provider'

const createPool = (modify: any) => {
    const config = {
        projectId: 'test-project',
    }

    return init({ ...config, ...modify })
}

const unplugEmulator = () => delete process.env['FIRESTORE_EMULATOR_HOST']

const setWrongCredentials = () => process.env['GOOGLE_APPLICATION_CREDENTIALS'] ='./libs/external-db-firestore/tests/drivers/broken_creds.json'

const dbOperationWithMisconfiguredProjectId = () => {
    unplugEmulator()
    setWrongCredentials()
    return createPool({ projectId: 'wrong' }).databaseOperations
}

export const dbOperationWithValidDB = () => {
    process.env['FIRESTORE_EMULATOR_HOST'] = 'localhost:8082'
    const { databaseOperations, cleanup } = createPool({ })
    return { dbOperations: databaseOperations, cleanup }
}

export const misconfiguredDbOperationOptions = () => ([['pool connection with wrong projectId.', () => dbOperationWithMisconfiguredProjectId()]])
