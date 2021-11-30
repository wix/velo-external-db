const { GoogleAuth } = require('google-auth-library')

const neededRoles = ['roles/secretmanager.secretAccessor', 'roles/cloudsql.editor']

class PermissionsProvision {
    constructor({ gcpClientEmail, gcpPrivateKey, gcpProjectId }) {
        this.authClient = new GoogleAuth({
            credentials: { client_email: gcpClientEmail, private_key: gcpPrivateKey },
            scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/cloudplatformprojects']
        })
        this.projectId = gcpProjectId
    }

    async createServiceAccount({ instanceName }) {
        const client = await this.credentialsFor()
        const CreateServiceAccountRestUrl = `https://iam.googleapis.com/v1/projects/${this.projectId}/serviceAccounts`
        const res = await client.request({ url: CreateServiceAccountRestUrl, method: 'POST', data: { accountId: instanceName } })
        return res.data.email
    }

    async currentPolicyFor(client) {
        const getIamPolicyRestUrl = `https://cloudresourcemanager.googleapis.com/v3/projects/${this.projectId}:getIamPolicy`
        const res = await client.request({ url: getIamPolicyRestUrl, method: 'POST' })
        return res.data.bindings
    }
    neededPolicyFor(serviceAccount) {
        return neededRoles.map(r => ({ role: r, members: [`serviceAccount:${serviceAccount}`] }))
    }

    async grantPermission({ serviceAccount }) {
        const setIamPolicyRestUrl = `https://cloudresourcemanager.googleapis.com/v3/projects/${this.projectId}:setIamPolicy`

        const client = await this.credentialsFor()
        const currentPolicy = await this.currentPolicyFor(client)
        const newPolicy = this.neededPolicyFor(serviceAccount)

        await client.request({ url: setIamPolicyRestUrl, method: 'POST', data: { policy: { bindings: [...currentPolicy, ...newPolicy] } } })
    }

    async credentialsFor() {
        return await this.authClient.getClient()
    }

}

module.exports = PermissionsProvision
