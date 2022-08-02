import path = require('path')
import ejs = require('ejs')
import { promises as fs } from 'fs'

const getAppInfoTemplate = async() => { // TODO: fix this hack!
    try {
        return await fs.readFile(path.join( __dirname, '..', 'views', 'index.ejs'), 'utf8')
    } catch (err) {
        return await fs.readFile(path.join( __dirname, 'views', 'index.ejs'), 'utf8')
    }

    
}

export const getAppInfoPage = async(appInfo: any) => {
    const appInfoTemplate = await getAppInfoTemplate()
    const appInfoPage = ejs.render(appInfoTemplate, appInfo)
    return appInfoPage
}
