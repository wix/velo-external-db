const {GoogleAuth} = require('google-auth-library')
const AdapterImageUrl = 'gcr.io/wix-velo-api/velo-external-db'

class AdapterProvision {
    constructor(credentials, region) {
        this.authClient = new GoogleAuth({
            credentials : { client_email: credentials.gcpClientEmail, private_key: credentials.gcpPrivateKey },
            scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/service.management']
        })
        this.region = region
    }

    async createAdapter(name, engine, secrets, connectionName) {
        const { client, projectId } = await this.credentialsFor()
        await this.createCloudRunInstance(name, engine, secrets, connectionName, client, projectId)
        await this.allowIncomingRequests(name, client, projectId)        
    }

    async adapterStatus(serviceName) {
        const { client, projectId } = await this.credentialsFor()
        const StatusCloudRunRestUrl = `https://${this.region}-run.googleapis.com/apis/serving.knative.dev/v1/namespaces/${projectId}/services/${serviceName}`
        const res = await client.request({ url: StatusCloudRunRestUrl})
        const readyStatus = res.data.status.conditions.find(i => i.type === 'Ready')
        return readyStatus.status === 'True'
    }

    
    secretsToEnvs(secrets) { 
        return Object.entries(secrets).map(([envVariable, secretName])=> {
            return {
                name: envVariable,
                valueFrom: {
                    secretKeyRef: { key: 'latest', name: secretName }
                }
            } 

        })
    }
    
    async createCloudRunInstance(name, engine, secrets, connectionName, client, projectId) {
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
                        annotations: { 'run.googleapis.com/cloudsql-instances': `${projectId}:${this.region}:${connectionName}`}
                },
                spec: {
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
                ],
                etag: 'ACAB'
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