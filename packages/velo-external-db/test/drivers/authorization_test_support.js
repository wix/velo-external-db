const { dbTeardown, initApp } = require('../resources/e2e_resources')

const DefaultPolicies = ['Admin']

const authRoleConfig = (collectionName, read, write) => {
    const config = {
        collectionPermissions: [
            {
                id: collectionName,
                read: [...DefaultPolicies, ...read],
                write: [...DefaultPolicies, ...write]
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