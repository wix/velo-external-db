import * as path from 'path'
import * as ejs from 'ejs'
import { AnyFixMe } from '@wix-velo/velo-external-db-types'
const fs = require('fs').promises

const getAppInfoTemplate = async() => {
    return await fs.readFile(path.join( __dirname, 'views', 'index.ejs'), 'utf8')
}

export const getAppInfoPage = async(appInfo: AnyFixMe) => {
    const appInfoTemplate = await getAppInfoTemplate()
    const appInfoPage = ejs.render(appInfoTemplate, appInfo)
    return appInfoPage
}



