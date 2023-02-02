import { initApp } from '../resources/e2e_resources'

export const givenHideAppInfoEnvIsTrue = async() => {    
    process.env.HIDE_APP_INFO = 'true'
    await initApp()
}
