const { GoogleAuth } = require('google-auth-library')
const AdapterImageUrl = 'gcr.io/wix-velo-api/velo-external-db'

class AdapterProvision {
    constructor({ gcpClientEmail, gcpPrivateKey, gcpProjectId }, region) {
        this.authClient = new GoogleAuth({
            credentials: { client_email: gcpClientEmail, private_key: gcpPrivateKey },
            scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/service.management']
        })
        this.region = region
        this.projectId = gcpProjectId
    }

    async createAdapter(name, engine, secretId, secrets, provisionVariables, connectionName, serviceAccount) {
        const client = await this.credentialsFor()
        const instanceName = await this.createCloudRunInstance(name, engine, connectionName, secrets, serviceAccount, client)
        await this.allowIncomingRequests(name, client)
        return instanceName         
    }

    async postCreateAdapter() {
    }

    async adapterStatus(serviceId, provisionVariables, instanceName) {
        const client = await this.credentialsFor()
        const StatusCloudRunRestUrl = `https://${this.region}-run.googleapis.com/apis/serving.knative.dev/v1/namespaces/${this.projectId}/services/${instanceName}`
        const res = await client.request({ url: StatusCloudRunRestUrl })
        const readyStatus = res.data.status.conditions.find(i => i.type === 'Ready')
        return { 
            available: readyStatus.status === 'True',
            serviceUrl: res.data.status?.url
         }
    }

    secretsToEnvs(secrets) { 
        return Object.entries(secrets).map(([envVariable, secretName]) => {
            return {
                name: envVariable,
                valueFrom: { secretKeyRef: { key: 'latest', name: secretName } }
            } 

        })
    }
    
    async createCloudRunInstance(name, engine, connectionName, secrets, serviceAccountEmail, client) {
        const CreateCloudRunRestUrl = `https://${this.region}-run.googleapis.com/apis/serving.knative.dev/v1/namespaces/${this.projectId}/services/`
        
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
                  'run.googleapis.com/launch-stage': 'BETA'
              },
              name,
              namespace: this.projectId
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

        const res = await client.request({ url: CreateCloudRunRestUrl, method: 'POST', data: adapterInstanceProperties })
        return res.data.metadata.name
    }

    async allowIncomingRequests(instanceName, client) {
        const AuthenticationRestUrl = `https://run.googleapis.com/v1/projects/${this.projectId}/locations/us-central1/services/${instanceName}:setIamPolicy`
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
        return await this.authClient.getClient()
    }
}


module.exports = AdapterProvision
