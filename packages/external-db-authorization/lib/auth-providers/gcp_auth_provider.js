const { GoogleAuth } = require('google-auth-library')
const GoogleStrategy = require('passport-google-oauth20').Strategy

class GcpAuthProvider {
  constructor({ clientId, clientSecret, callbackUrl }) {
    this.options = {
      clientID: clientId,
      clientSecret: clientSecret,
      callbackURL: callbackUrl,
      scope: ['email', 'profile']
    }

    return new GoogleStrategy(this.options, this.verify.bind(this))
  }

  verify(accessToken, tokenSecret, profile, cb) {
    const usersEmail = profile._json.email 

    this.getProjectOwners().then(projectOwners => projectOwners.includes(usersEmail) ? cb(null, profile) : cb('Unauthorized', null))
                           .catch(err => cb(`Error fetching project owners: ${err}`, null) )
  
  }

  async getProjectOwners() {
    const authClient = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' })
    const client = await authClient.getClient()
    const projectId = await authClient.getProjectId()
    const getIamPolicyRestUrl = `https://cloudresourcemanager.googleapis.com/v1/projects/${projectId}:getIamPolicy`

    const res = await client.request({ method: 'POST', url: getIamPolicyRestUrl })
    const { members: allOwners } = res.data.bindings.find(i => i.role === 'roles/owner')

    const projectOwnersUsers = allOwners.filter(i => i.startsWith('user:')).map(i => i.split(':')[1])

    return projectOwnersUsers
  }


}

module.exports = { GcpAuthProvider }
