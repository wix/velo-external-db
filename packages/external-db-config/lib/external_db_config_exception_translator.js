const {MissingRequiredProps, ExternalDbConfigError} = require ('./errors')

const translateErrorCodes = (err,missingRequiredProps) => {
    switch (err) {
        case 'MISSING_VARIABLE':
            throw new MissingRequiredProps(`Please set the next variable/s in your secret manger: `,missingRequiredProps);   
        default:
            throw new ExternalDbConfigError (`Error occurred retrieving secrets: ${err}`);
    }
}

module.exports = translateErrorCodes