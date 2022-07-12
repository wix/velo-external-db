import { CollectionPermissions, VeloRole, WixDataRole } from '@wix-velo/velo-external-db-types'

import { errors } from '@wix-velo/velo-external-db-commons'
const { UnauthorizedError } = errors
const DefaultPolicies = ['Admin']

export default class RoleAuthorizationService {
    config: CollectionPermissions[]
    constructor(config: CollectionPermissions[] = []) {
        this.config = config
    }

    authorizeRead(collectionName: string, role: WixDataRole) {
        const readPolicies = this.readPoliciesFor(collectionName)

        if (!readPolicies.includes(this.dataToVeloRole(role))) throw new UnauthorizedError('You are not authorized')
    }
    
    authorizeWrite(collectionName: string, role: WixDataRole) {
        const writePolicies = this.writePoliciesFor(collectionName)
        
        if (!writePolicies.includes(this.dataToVeloRole(role))) throw new UnauthorizedError('You are not authorized')
    }

    setConfig(config: CollectionPermissions[]) {
        this.config = config
    }

    policiesFor(collectionName: string) {
        return this.config.find(p => p.id === collectionName)
    }

    readPoliciesFor(collectionName: string) {
        return this.policiesFor(collectionName)?.read || DefaultPolicies
    }

    writePoliciesFor(collectionName: string) {
        return this.policiesFor(collectionName)?.write || DefaultPolicies
    }

    dataToVeloRole(role: WixDataRole): VeloRole { 
        switch (role) {
            case 'OWNER':
            case 'BACKEND_CODE':
                return 'Admin'
            case 'MEMBER':
                return 'Member'
            case 'VISITOR':
                return 'Visitor'
            default:
                return role
        }
    }     
}
