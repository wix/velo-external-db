import path = require('path')
import ejs = require('ejs')
import { promises as fs } from 'fs'

const getAppInfoTemplate = async(hideAppInfo?: boolean) => { // TODO: fix this hack!
    const fileName = hideAppInfo ? 'index-without-data.ejs' : 'index.ejs' 
    try {
        return await fs.readFile(path.join( __dirname, '..', 'views', fileName), 'utf8')
    } catch {
        return await fs.readFile(path.join( __dirname, 'views', fileName), 'utf8')
    }

    
}

export const getAppInfoPage = async(appInfo: any, hideAppInfo?: boolean) => {
    const appInfoTemplate = await getAppInfoTemplate(hideAppInfo)
    const appInfoPage = ejs.render(appInfoTemplate, appInfo)
    return appInfoPage
}
