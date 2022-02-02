const { gen }  = require('test-commons')
console.log(gen)
const Chance = require('chance')
const chance = Chance()

const veloRoles = ['OWNER', 'BACKEND_CODE', 'MEMBER', 'VISITOR']

const collectionConfigEntity = () => ({
    id: chance.word(),
    readPolicies: gen.randomElementsFromArray(veloRoles),
    writePolicies: gen.randomElementsFromArray(veloRoles)
})

const authorizationConfig = () => gen.randomArrayOf( collectionConfigEntity )

const collectionNameFrom = (config) => gen.randomObjectFromArray(config).id

const readRolesFor = (collectionName, config) => config.find(c => c.id = collectionName).readPolicies
const writeRolesFor = (collectionName, config) => config.find(c => c.id = collectionName).writePolicies

const authorizedReadRoleFor = (collectionName, config) => gen.randomObjectFromArray(readRolesFor(collectionName, config))

const unauthorizedReadRoleFor = (collectionName, config) => gen.randomObjectFromArray(
                                                                veloRoles.filter(x => !readRolesFor(collectionName, config).includes(x))
                                                                )

const authorizedWriteRoleFor = (collectionName, config) => gen.randomObjectFromArray(writeRolesFor(collectionName, config))

const unauthorizedWriteRoleFor = (collectionName, config) => gen.randomObjectFromArray(
                                                                veloRoles.filter(x => !writeRolesFor(collectionName, config).includes(x))
                                                                )


module.exports = { authorizationConfig, collectionNameFrom, authorizedReadRoleFor, unauthorizedReadRoleFor, authorizedWriteRoleFor, unauthorizedWriteRoleFor }