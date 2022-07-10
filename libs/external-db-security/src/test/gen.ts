import { gen } from '@wix-velo/test-commons'
import { CollectionPermissions, VeloRole, WixDataRole } from '@wix-velo/velo-external-db-types'
import Chance = require('chance')
const chance = Chance()

const veloRoles = ['Admin', 'Member', 'Visitor']

const collectionConfigEntity = () => ({
    id: chance.word(),
    read: gen.randomElementsFromArray(veloRoles),
    write: gen.randomElementsFromArray(veloRoles)
})

export const authorizationConfig = () => gen.randomArrayOf( collectionConfigEntity )

export const collectionNameFrom = (config: CollectionPermissions[]) => gen.randomObjectFromArray(config).id

const readRolesFor = (collectionName: string, config: CollectionPermissions[]) => config.find((c) => c.id === collectionName)?.read || []
const writeRolesFor = (collectionName: string, config: CollectionPermissions[]) => config.find((c) => c.id === collectionName)?.write || []

export const authorizedReadRoleFor = (collectionName: string, config: CollectionPermissions[]) => veloRoleToData(gen.randomObjectFromArray(readRolesFor(collectionName, config)))

export const unauthorizedReadRoleFor = (collectionName: string, config: any) => veloRoleToData(gen.randomObjectFromArray(
                                                                veloRoles.filter(x => !readRolesFor(collectionName, config).includes((x as VeloRole)))
                                                                ))

export const authorizedWriteRoleFor = (collectionName: string, config: any) => veloRoleToData(gen.randomObjectFromArray(writeRolesFor(collectionName, config)))

export const unauthorizedWriteRoleFor = (collectionName: string, config: any) => veloRoleToData(gen.randomObjectFromArray(
                                                                veloRoles.filter(x => !writeRolesFor(collectionName, config).includes(x as VeloRole)))
                                                                )

const veloRoleToData = (role: VeloRole): WixDataRole => { 
    switch (role) {
        case 'Admin':
            return 'OWNER'
        case 'Member':
            return 'MEMBER'
        case 'Visitor':
            return 'VISITOR'
    }
}   
