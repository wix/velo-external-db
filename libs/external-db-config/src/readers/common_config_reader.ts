import { IConfigReader } from '../types'

export default class CommonConfigReader implements IConfigReader {
    constructor() { }

    readConfig() {
        const { CLOUD_VENDOR, TYPE, REGION, SECRET_NAME, EXTERNAL_DATABASE_ID, ALLOWED_METASITES } = process.env
        return { vendor: CLOUD_VENDOR, type: TYPE, region: REGION, secretId: SECRET_NAME, externalDatabaseId: EXTERNAL_DATABASE_ID, allowedMetasites: ALLOWED_METASITES }
    }
}
