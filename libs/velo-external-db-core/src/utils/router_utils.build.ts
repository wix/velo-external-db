import * as path from 'path'
import * as ejs from 'ejs'
import { AnyFixMe } from '@wix-velo/velo-external-db-types'
const fs = require('fs').promises

const getAppInfoTemplate = async(hideAppInfo: boolean) => {
    const fileName = hideAppInfo ? 'index-without-data.ejs' : 'index.ejs' 
    return await fs.readFile(path.join( __dirname, 'views', fileName), 'utf8')
}

export const getAppInfoPage = async(appInfo: AnyFixMe, hideAppInfo: boolean) => {
    const appInfoTemplate = await getAppInfoTemplate(hideAppInfo)
    const appInfoPage = ejs.render(appInfoTemplate, appInfo)
    return appInfoPage
}
