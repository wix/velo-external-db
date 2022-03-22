const { URL } = require('url')
const https = require('https')
const fs = require('fs')

const documentDBConnectionOptions = async(cfg, path) => {
    const documentDbUri = new URL(cfg.connectionUri)

    if (documentDbUri.searchParams.get('ssl_ca_certs') === 'rds-combined-ca-bundle.pem') {
        documentDbUri.searchParams.delete('ssl_ca_certs')
        await https.get('https://s3.amazonaws.com/rds-downloads/rds-combined-ca-bundle.pem', resp => resp.pipe(fs.createWriteStream(`${path}/rds-combined-ca-bundle.pem`)))
        return {
            connectionUri: documentDbUri.toString(),
            options: { tlsCAFile: `${path}/rds-combined-ca-bundle.pem` }
        }
    }
    
    return { connectionUri: documentDbUri.toString(), options: {} }
}

module.exports = { documentDBConnectionOptions }