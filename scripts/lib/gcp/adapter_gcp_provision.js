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

    async createAdapter(name, engine, secrets, connectionName) {
        const client = await this.authClient.getClient()
        const projectId = await this.authClient.getProjectId()
        const apiUrl = `https://${this.region}-run.googleapis.com/apis/serving.knative.dev/v1/namespaces/${projectId}/services/`
        const authApiUrl = `https://run.googleapis.com/v1/projects/${projectId}/locations/us-central1/services/${name}:setIamPolicy`

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

        const authData = {
            'policy': {
              'bindings': [
                {
                  'members': [
                    'allUsers'
                  ],
                  'role': 'roles/run.invoker'
                }
              ],
              'etag': 'ACAB'
            }
          }

        await client.request({ url: apiUrl, method: 'POST', data: adapterInstanceProperties })

        await client.request({ url: authApiUrl, method: 'POST', data: authData })

    }

    async adapterStatus(serviceId) {
    }

    async rdsRoleArn() {
    }
}


module.exports = AdapterProvision