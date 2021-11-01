
const providerFor = (vendor) => {
    switch (vendor) {
        case 'gcp':
            return require('./gcp')
        case 'aws':
            return require('./aws')
        case 'azure':
            return require ('./azure')
    }
}

module.exports = { providerFor }
