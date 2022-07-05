class CommonConfigReader {
    constructor() { }

    readConfig() {
        const { CLOUD_VENDOR, TYPE, REGION, SECRET_NAME } = process.env
        return { vendor: CLOUD_VENDOR, type: TYPE, region: REGION, secretId: SECRET_NAME }
    }
}

module.exports = CommonConfigReader