import { IConfigReader } from '../types'

export default class CommonConfigReader implements IConfigReader {
    constructor() { }

    readConfig() {
        const { CLOUD_VENDOR, TYPE, REGION, SECRET_NAME, HIDE_APP_INFO, READ_ONLY_SCHEMA } = process.env
        return { vendor: CLOUD_VENDOR, type: TYPE, region: REGION, secretId: SECRET_NAME, hideAppInfo: HIDE_APP_INFO ? HIDE_APP_INFO === 'true' : undefined, readOnlySchema: READ_ONLY_SCHEMA ? READ_ONLY_SCHEMA === 'true' : undefined  }
    }
}
