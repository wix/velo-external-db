import { initApp, dbTeardown } from '../resources/e2e_resources'

export const givenHideAppInfoEnvIsTrue = async() => {    
    await dbTeardown()
    process.env.HIDE_APP_INFO = 'true'
    await initApp()
}
