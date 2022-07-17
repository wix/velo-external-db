import { VeloRole } from '@wix-velo/velo-external-db-types'
import { dbTeardown, initApp } from '../resources/e2e_resources'

const DefaultPolicies = ['Admin']

const authRoleConfig = (collectionName: string, read: VeloRole[], write: VeloRole[]) => {
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

export const givenCollectionWithVisitorReadPolicy = async(collectionName: string) => {
    await dbTeardown()
    authRoleConfig(collectionName, ['Visitor'], [])
    await initApp()
}
