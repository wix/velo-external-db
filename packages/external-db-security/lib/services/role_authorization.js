const { UnauthorizedError } = require('velo-external-db-commons/lib/errors')
const DefaultPolicies = ['OWNER', 'BACKEND_CODE']

class RoleAuthorizationService {
    constructor(config) {
        this.config = config || []
    }

    authorizeRead(collectionName, role) {
        const readPolicies = this.readPoliciesFor(collectionName)
        
        if (!readPolicies.includes(role)) throw new UnauthorizedError('You are not authorized')
    }
    
    authorizeWrite(collectionName, role) {
        const writePolicies = this.writePoliciesFor(collectionName)
 
        if (!writePolicies.includes(role)) throw new UnauthorizedError('You are not authorized')
    }

    setConfig(config) {
        this.config = config
    }

    policiesFor(collectionName) {
        return this.config.find(p => p.id === collectionName)
    }

    readPoliciesFor(collectionName) {
        return this.policiesFor(collectionName)?.readPolicies || DefaultPolicies
    }

    writePoliciesFor(collectionName) {
        return this.policiesFor(collectionName)?.writePolicies || DefaultPolicies
    }
}

module.exports = RoleAuthorizationService