const { UnauthorizedError, InvalidQuery } = require('velo-external-db-commons/lib/errors')

class AuthorizationService {
    constructor(config) {
        this.config = config
    }

    authorizeRead(collectionName, role) {
        const readPolicies = this.readPoliciesFor(collectionName)
        
        if (!readPolicies) throw new InvalidQuery('There is no such collection in config')
        
        if (!readPolicies.includes(role)) throw new UnauthorizedError('You are not authorized')
    }
    
    authorizeWrite(collectionName, role) {
        const writePolicies = this.writePoliciesFor(collectionName)

        if (!writePolicies) throw new InvalidQuery('There is no such collection in config')
        
        if (!writePolicies.includes(role)) throw new UnauthorizedError('You are not authorized')
    }

    setConfig(config) {
        this.config = config
    }

    policiesFor(collectionName) {
        return this.config.find(p => p.id === collectionName)
    }

    readPoliciesFor(collectionName) {
        return this.policiesFor(collectionName)?.readPolicies
    }

    writePoliciesFor(collectionName) {
        return this.policiesFor(collectionName)?.writePolicies
    }
}

module.exports = AuthorizationService