const { dbTeardown, initApp } = require('../resources/e2e_resources')

const DefaultPolicies = ['Admin']

const authRoleConfig = (collectionName, readPolicies, writePolicies) => {
    const config = {
        collectionLevelConfig: [
            {
                id: collectionName,
                readPolicies: [...DefaultPolicies, ...readPolicies],
                writePolicies: [...DefaultPolicies, ...writePolicies]
            }
        ]
    }
    process.env.PERMISSIONS = JSON.stringify(config)
}

const givenCollectionWithVisitorReadPolicy = async(collectionName) => {
    await dbTeardown()
    authRoleConfig(collectionName, ['Visitor'], [])
    await initApp()
}

module.exports = { givenCollectionWithVisitorReadPolicy }