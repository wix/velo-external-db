const {GoogleAuth} = require('google-auth-library')
const { randomWithPrefix } = require('../../utils/utils')
const AdapterImageUrl = 'gcr.io/wix-velo-api/velo-external-db'

class AdapterProvision {
    constructor(credentials, region) {
        this.authClient = new GoogleAuth({
            credentials : { client_email: credentials.gcpClientEmail, private_key: credentials.gcpPrivateKey },
            scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/service.management']
        })
        this.region = region
    }

    async preCreateAdapter(secrets) {
        const { client, projectId } = await this.credentialsFor()
        const serviceAccountEmail = await this.createServiceAccount(client, projectId)
        await this.grantReadSecretsPermission(secrets, serviceAccountEmail, client, projectId)
        return serviceAccountEmail
    }
    async createAdapter(name, engine, _, secrets, __, serviceAccountEmail) {
        const { client, projectId } = await this.credentialsFor()
        await this.createCloudRunInstance(name, engine, secrets, serviceAccountEmail, client, projectId)
        await this.allowIncomingRequests(name, client, projectId)        
    }

    async adapterStatus(serviceName) {
        const { client, projectId } = await this.credentialsFor()
        const StatusCloudRunRestUrl = `https://${this.region}-run.googleapis.com/apis/serving.knative.dev/v1/namespaces/${projectId}/services/${serviceName}`
        const res = await client.request({ url: StatusCloudRunRestUrl})
        const readyStatus = res.data.status.conditions.find(i => i.type === 'Ready')
        return readyStatus.status === 'True'
    }

    async createServiceAccount(client, projectId) {
        const CreateServiceAccountRestUrl = `https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts`
        const accountId = randomWithPrefix('velo-adapter-account')
        const res = await client.request({ url: CreateServiceAccountRestUrl, method: 'POST', data: { accountId } })
        return res.data.email
    }
    
    async grantReadSecretsPermission(secrets, serviceAccountEmail, client, projectId) {
        const grantPermissionRequest = {
            policy: { bindings:[ { role: 'roles/secretmanager.secretAccessor', members: [`serviceAccount:${serviceAccountEmail}`] } ] }
        }

        await Promise.all(Object.values(secrets).map(async s => {
            const ServiceAccountsRestUrl = `https://secretmanager.googleapis.com/v1/projects/${projectId}/secrets/${s}:setIamPolicy`
            await client.request({ url: ServiceAccountsRestUrl, method: 'POST', data: grantPermissionRequest })
        }))

    }

    secretsToEnvs(secrets) { 
        return Object.entries(secrets).map(([envVariable, secretName])=> {
            return {
                name: envVariable,
                valueFrom: { secretKeyRef: { key: 'latest', name: secretName } }
            } 

        })
    }
    
    async createCloudRunInstance(name, engine, secrets, serviceAccountEmail, client, projectId) {
        const connectionName = secrets.CLOUD_SQL_CONNECTION_NAME.toLowerCase()
        const CreateCloudRunRestUrl = `https://${this.region}-run.googleapis.com/apis/serving.knative.dev/v1/namespaces/${projectId}/services/`
        
        const env = [
            { name: 'CLOUD_VENDOR', value: 'gcp' },
            { name: 'TYPE', value: engine },
            ...this.secretsToEnvs(secrets)
        ]

        const adapterInstanceProperties = {
            apiVersion: 'serving.knative.dev/v1',
            kind: 'Service',
            metadata: {
              annotations: {
                  'run.googleapis.com/launch-stage' : 'BETA'
              },
              name: name,
              namespace: projectId
            },
            spec: {
                template: {
                    metadata: {
                        annotations: { 'run.googleapis.com/cloudsql-instances': connectionName }
                },
                spec: {
                    serviceAccountName: serviceAccountEmail,
                    containers: [
                        { image: AdapterImageUrl, env }
                    ]
                }
              }
            }
        }

        await client.request({ url: CreateCloudRunRestUrl, method: 'POST', data: adapterInstanceProperties })
    }

    async allowIncomingRequests(instanceName, client, projectId) {
        const AuthenticationRestUrl = `https://run.googleapis.com/v1/projects/${projectId}/locations/us-central1/services/${instanceName}:setIamPolicy`
        const authData = {
            policy: {
                bindings: [
                    {
                        members: [ 'allUsers' ],
                        role: 'roles/run.invoker'
                    }
                ]
            }
        }

        await client.request({ url: AuthenticationRestUrl, method: 'POST', data: authData })
    }
    
    async credentialsFor() {
        const client = await this.authClient.getClient()
        const projectId = await this.authClient.getProjectId()
        return { client, projectId }
    }
}


module.exports = AdapterProvision