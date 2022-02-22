const { dbTeardown, initApp } = require('../resources/e2e_resources')

const DefaultPolicies = ['OWNER', 'BACKEND_CODE']

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
    process.env.roleConfig = JSON.stringify(config)
}

const givenCollectionWithVisitorReadPolicy = async(collectionName) => {
    await dbTeardown()
    authRoleConfig(collectionName, ['VISITOR'], [])
    await initApp()
}

module.exports = { givenCollectionWithVisitorReadPolicy }