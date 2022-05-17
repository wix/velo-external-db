const { errors } = require('velo-external-db-commons')
const { UnauthorizedError } = errors
const DefaultPolicies = ['Admin']

class RoleAuthorizationService {
    constructor(config) {
        this.config = config || []
    }

    authorizeRead(collectionName, role) {
        const readPolicies = this.readPoliciesFor(collectionName)

        if (!readPolicies.includes(this.dataToVeloRole(role))) throw new UnauthorizedError('You are not authorized')
    }
    
    authorizeWrite(collectionName, role) {
        const writePolicies = this.writePoliciesFor(collectionName)
        
        if (!writePolicies.includes(this.dataToVeloRole(role))) throw new UnauthorizedError('You are not authorized')
    }

    setConfig(config) {
        this.config = config
    }

    policiesFor(collectionName) {
        return this.config.find(p => p.id === collectionName)
    }

    readPoliciesFor(collectionName) {
        return this.policiesFor(collectionName)?.read || DefaultPolicies
    }

    writePoliciesFor(collectionName) {
        return this.policiesFor(collectionName)?.write || DefaultPolicies
    }

    dataToVeloRole(role) { 
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

module.exports = RoleAuthorizationService