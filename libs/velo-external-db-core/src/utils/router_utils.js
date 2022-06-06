const path = require('path')
const ejs = require('ejs')
const fs = require('fs').promises

const getAppInfoTemplate = async() => {
    return await fs.readFile(path.join( __dirname, '../views', 'index.ejs'), 'utf8')
}

const getAppInfoPage = async(appInfo) => {
    const appInfoTemplate = await getAppInfoTemplate()
    const appInfoPage = ejs.render(appInfoTemplate, appInfo)
    return appInfoPage
}

module.exports = { getAppInfoPage }



