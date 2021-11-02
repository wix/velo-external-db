const AwsEmptyCredentials = { accessKeyId: '', secretAccessKey: '' }

const credentialsFor = (impl) => {
    try {
        return require('../../.credentials.json')
    } catch (e) {
        switch (impl) {
            case 'aws':
                return AwsEmptyCredentials
            default:
                return { }
        }
    }
}

module.exports = { credentialsFor }