


const translateErrorCodes = (err,missingRequiredProps) => {
    switch (err) {
        case 'MISSING_VARIABLE':
            throw new Error(`Please set the next variable/s in your secret manger: ${missingRequiredProps}`);   
        default:
            throw new Error (`Error occurred retrieving secrets: ${err}`);
    }
}

module.exports = translateErrorCodes