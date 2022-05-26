const { URL } = require('url')
const https = require('https')
const fs = require('fs')

const documentDBConnectionOptions = async(cfg, path) => {
    return new Promise(resolve => {
        const documentDbUri = new URL(cfg.connectionUri)

        if (documentDbUri.searchParams.get('ssl_ca_certs') === 'rds-combined-ca-bundle.pem') {
            documentDbUri.searchParams.delete('ssl_ca_certs')
            const file = fs.createWriteStream(`${path}/rds-combined-ca-bundle.pem`)
            https.get('https://s3.amazonaws.com/rds-downloads/rds-combined-ca-bundle.pem', resp => resp.pipe(file))
            file.on('finish', () => resolve({
                connectionUri: documentDbUri.toString(), options: { tlsCAFile: `${path}/rds-combined-ca-bundle.pem` }
            }))
        }

        else {
            resolve( { connectionUri: documentDbUri.toString(), options: {} })
        }
    })

}

module.exports = { documentDBConnectionOptions }