import { IConfigReader } from '../types'

export default class CommonConfigReader implements IConfigReader {
    constructor() { }

    readConfig() {
        const { CLOUD_VENDOR, TYPE, REGION, SECRET_NAME, ALLOWED_METASITES, HIDE_APP_INFO } = process.env
        return { vendor: CLOUD_VENDOR, type: TYPE, region: REGION, secretId: SECRET_NAME, allowedMetasites: ALLOWED_METASITES, hideAppInfo: HIDE_APP_INFO ? HIDE_APP_INFO === 'true' : undefined }
    }
}
