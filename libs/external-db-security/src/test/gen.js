const { gen }  = require('@wix-velo/test-commons')
const Chance = require('chance')
const chance = Chance()

const veloRoles = ['Admin', 'Member', 'Visitor']

const collectionConfigEntity = () => ({
    id: chance.word(),
    read: gen.randomElementsFromArray(veloRoles),
    write: gen.randomElementsFromArray(veloRoles)
})

const authorizationConfig = () => gen.randomArrayOf( collectionConfigEntity )

const collectionNameFrom = (config) => gen.randomObjectFromArray(config).id

const readRolesFor = (collectionName, config) => config.find(c => c.id = collectionName).read
const writeRolesFor = (collectionName, config) => config.find(c => c.id = collectionName).write

const authorizedReadRoleFor = (collectionName, config) => veloRoleToData(gen.randomObjectFromArray(readRolesFor(collectionName, config)))

const unauthorizedReadRoleFor = (collectionName, config) => veloRoleToData(gen.randomObjectFromArray(
                                                                veloRoles.filter(x => !readRolesFor(collectionName, config).includes(x))
                                                                ))

const authorizedWriteRoleFor = (collectionName, config) => veloRoleToData(gen.randomObjectFromArray(writeRolesFor(collectionName, config)))

const unauthorizedWriteRoleFor = (collectionName, config) => veloRoleToData(gen.randomObjectFromArray(
                                                                veloRoles.filter(x => !writeRolesFor(collectionName, config).includes(x))
                                                                ))

const veloRoleToData = (role) => { 
    switch (role) {
        case 'Admin':
            return 'OWNER'
        case 'Member':
            return 'MEMBER'
        case 'Visitor':
            return 'VISITOR'
    }
}   

module.exports = { authorizationConfig, collectionNameFrom, authorizedReadRoleFor, unauthorizedReadRoleFor, authorizedWriteRoleFor, unauthorizedWriteRoleFor }