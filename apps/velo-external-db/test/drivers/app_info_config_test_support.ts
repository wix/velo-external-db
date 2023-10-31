import { dbTeardown, initApp } from '../resources/e2e_resources'

export const givenHideAppInfoEnvIsTrue = async() => {    
    await dbTeardown()
    process.env.HIDE_APP_INFO = 'true'
    await initApp()

    // Fix for tests running in Node 20.
    await new Promise(resolve => setTimeout(resolve, 5))
}
