
/* 
const { google } = require('googleapis')
const axios = require('axios').default

const serviceAccount = {
    projectId: 'corvid-managed-cfe9809c',
    email: 'script-user@corvid-managed-cfe9809c.iam.gserviceaccount.com',
    key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCv1c6B07t1QRzd\nxUmU38xuvQn2XNlY13aBHBm6nIXJHvt1iAO04lmKrcnPtZxnU/Q2bMz6HVcOrlWk\nReou7ATEHdL/6erFM7pav24vi+N99hSRv3OzBpEjXpZbvQnW9HuAbtbSmk2IlFSz\n1WhLzkLl1cib0P9JqcKLz8Uw/Bq6cmyJr2jh8jiiJ1E1y8z7nK2992DLCWQ8QnJ9\nk5ujXvvdQgIOTjC9ATEpfktOSXltvmOYBJoGLFzoDK1ipW+w+5U6ppHIsPWOIJdU\nL49yQuHXL3SjxvffcXN/OhXfBob917MSzktb+7c+KO90i6bPs1DYOckVSCSxTytc\n0YqpsnzzAgMBAAECggEAD6xS2aGs45kSi0tgRq6Ng2Vtnjx30dfKzrFZiG0WmRnI\n4kNlyS7P5Ruekdl8qn0s7IOq4F8oeRIzEg8lU69isV8ohU/YHGHYVOnGrDhKO9pp\nH6CyyHISZ9ZbjVZ+ql66eh/nHXihkUYKKB7NSsyE4VsP+aDvJdAa8Olr3fTq0P7n\njLKD0djNGS0pKwpup2CzyKbs3tlMFpgX7ugnHw4IlJU2WbD6ro4kC+6Y3pKABIAr\ntvRLBHEB6g+07SkLqZA7sipCPmzCuguMDPj+EsoYFCO3s7OFZMi05oGlQRAW1bn0\nGt1gyKaW0hnqJPtaLNmkAR6meWYDbj5vOc5URlKyYQKBgQDYKUQvsnprqneoZ4aP\nk2deRnEtUuvc7cUz51KToLbM7GrL7agkvTIpU1O5+XEAi1Ykk/K5sdYfBOW/qYjT\nkKm1ezmqwXiblzPu2wQvgA5t+/vHsmJ2rbZ1Is/1cmWrTArqG7eWG7YmI9nIYJvS\nH8y4g5wMQgAypAKf1v3lyTjzAwKBgQDQPemhYYQWj+bVCyxCbQNfzCFTmff5kqQM\ndAn8/LCzds1pn7igSbAJMSEjy6JEMcM6ZPZfCJ/C5uw//99pTv76gZfNTaTHG3JB\nhlCBbALdfSqYtSBElpAiQeRrEV+jpyGIHW1n0HotfebI0aPR7pcqK3PCHHV4ebGu\nyjIYC2wzUQKBgF5rsCgxiv4KqVf7WLDQj3+Dv54vsW2AwvpIGi74LcFXp9LKTf82\nUXnxtwnuZqj5NDioE4d/oetMxVqyIF1hvG/Ukrz+48L7CilUrABfrG3oevOg/Reg\nC6og+bvaK4Tmo4Hdd5TvJ+KDGHdJk+b2EwOqIXjNP67fK3JMg/1ipyinAoGAIGTx\nOjSkSqo6G3wwd2jj9HwZ1xqFk+J2+KT4hM1+Y3ygucSqAO1VoChvYlUkOf2PxD6+\ngMwjpjssF0yjoYszaR7N0Zc5gevIG19cmLWHwJLfFIBgs6rEYz/i27EJMrkmIzmI\nsnSg/QCv7R+Hn3nBNEMsL88jiwlLVciIgGsOevECgYEAhLeC4h1Xck/W8m835yux\nOaHHojYvz04i2x0UK0sZP44BmS4KDaz+RKF1UkUhvmvcf+H7Zu1DdAkHCprnwAyq\nFlzLxGxYV7HjuF306lNi1Ulyl3XrfiIK7fPU8pLo2vscTag8R2m8SF7YJKXqKLpY\njkav2NUF3TA+nxMoDB3eijE=\n-----END PRIVATE KEY-----\n',
}


const serviceAccountToken = new google.apikeys()

const serviceAccountToken2 = new google.auth.JWT(
    serviceAccount.email, null, serviceAccount.key,
    [ 'https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/sqlservice.admin' ],
    null
)

const provisionSql = async (authorization, projectId) => {
    const url = `https://sqladmin.googleapis.com/sql/v1beta4/projects/${projectId}/instances`

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': authorization,
    }

    const config = {
        headers 
    }

    const data = {
        'databaseVersion': 'MYSQL_5_7',
        'name': 'my-test22',
        'settings': {
          'tier': 'db-f1-micro'
        },
        'rootPassword': 'myPass'
      }

      try {
          const res = await axios.post(url, data, config)
          console.log(res)
      } catch(e) {
          console.log(e.response)
      }



}

const main = async (serviceAccount) => {
    await provisionSql(serviceAccountToken, serviceAccount.projectId)

}

main(serviceAccount)




*/

const {GoogleAuth} = require('google-auth-library')

/**
* Instead of specifying the type of client you'd like to use (JWT, OAuth2, etc)
* this library will automatically choose the right client based on the environment.
*/
/*
async function main() {

    const serviceAccount = {
        projectId: 'corvid-managed-cfe9809c',
        email: 'script-user@corvid-managed-cfe9809c.iam.gserviceaccount.com',
        key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCv1c6B07t1QRzd\nxUmU38xuvQn2XNlY13aBHBm6nIXJHvt1iAO04lmKrcnPtZxnU/Q2bMz6HVcOrlWk\nReou7ATEHdL/6erFM7pav24vi+N99hSRv3OzBpEjXpZbvQnW9HuAbtbSmk2IlFSz\n1WhLzkLl1cib0P9JqcKLz8Uw/Bq6cmyJr2jh8jiiJ1E1y8z7nK2992DLCWQ8QnJ9\nk5ujXvvdQgIOTjC9ATEpfktOSXltvmOYBJoGLFzoDK1ipW+w+5U6ppHIsPWOIJdU\nL49yQuHXL3SjxvffcXN/OhXfBob917MSzktb+7c+KO90i6bPs1DYOckVSCSxTytc\n0YqpsnzzAgMBAAECggEAD6xS2aGs45kSi0tgRq6Ng2Vtnjx30dfKzrFZiG0WmRnI\n4kNlyS7P5Ruekdl8qn0s7IOq4F8oeRIzEg8lU69isV8ohU/YHGHYVOnGrDhKO9pp\nH6CyyHISZ9ZbjVZ+ql66eh/nHXihkUYKKB7NSsyE4VsP+aDvJdAa8Olr3fTq0P7n\njLKD0djNGS0pKwpup2CzyKbs3tlMFpgX7ugnHw4IlJU2WbD6ro4kC+6Y3pKABIAr\ntvRLBHEB6g+07SkLqZA7sipCPmzCuguMDPj+EsoYFCO3s7OFZMi05oGlQRAW1bn0\nGt1gyKaW0hnqJPtaLNmkAR6meWYDbj5vOc5URlKyYQKBgQDYKUQvsnprqneoZ4aP\nk2deRnEtUuvc7cUz51KToLbM7GrL7agkvTIpU1O5+XEAi1Ykk/K5sdYfBOW/qYjT\nkKm1ezmqwXiblzPu2wQvgA5t+/vHsmJ2rbZ1Is/1cmWrTArqG7eWG7YmI9nIYJvS\nH8y4g5wMQgAypAKf1v3lyTjzAwKBgQDQPemhYYQWj+bVCyxCbQNfzCFTmff5kqQM\ndAn8/LCzds1pn7igSbAJMSEjy6JEMcM6ZPZfCJ/C5uw//99pTv76gZfNTaTHG3JB\nhlCBbALdfSqYtSBElpAiQeRrEV+jpyGIHW1n0HotfebI0aPR7pcqK3PCHHV4ebGu\nyjIYC2wzUQKBgF5rsCgxiv4KqVf7WLDQj3+Dv54vsW2AwvpIGi74LcFXp9LKTf82\nUXnxtwnuZqj5NDioE4d/oetMxVqyIF1hvG/Ukrz+48L7CilUrABfrG3oevOg/Reg\nC6og+bvaK4Tmo4Hdd5TvJ+KDGHdJk+b2EwOqIXjNP67fK3JMg/1ipyinAoGAIGTx\nOjSkSqo6G3wwd2jj9HwZ1xqFk+J2+KT4hM1+Y3ygucSqAO1VoChvYlUkOf2PxD6+\ngMwjpjssF0yjoYszaR7N0Zc5gevIG19cmLWHwJLfFIBgs6rEYz/i27EJMrkmIzmI\nsnSg/QCv7R+Hn3nBNEMsL88jiwlLVciIgGsOevECgYEAhLeC4h1Xck/W8m835yux\nOaHHojYvz04i2x0UK0sZP44BmS4KDaz+RKF1UkUhvmvcf+H7Zu1DdAkHCprnwAyq\nFlzLxGxYV7HjuF306lNi1Ulyl3XrfiIK7fPU8pLo2vscTag8R2m8SF7YJKXqKLpY\njkav2NUF3TA+nxMoDB3eijE=\n-----END PRIVATE KEY-----\n',
    }

  const auth = new GoogleAuth({
      credentials: {
        client_email: serviceAccount.email,
        private_key: serviceAccount.key
      },
      scopes: 'https://www.googleapis.com/auth/cloud-platform'
  })

  const client = await auth.getClient();
  const projectId = await auth.getProjectId();


  const data = {
    'databaseVersion': 'MYSQL_5_7',
    'name': 'my-test33',
    'settings': {
      'tier': 'db-f1-micro'
    },
    'rootPassword': 'myPass'
  }
  
  const url = `https://sqladmin.googleapis.com/sql/v1beta4/projects/${projectId}/instances`;
  const res = await client.request({ url });
  const { state, ipAddresses, connectionName, databaseVersion } = res.data.items.find(i => i.name === 'velo-external-db-5055')
  console.log({ 
    available: state === 'RUNNABLE',
    ipAddresses: ipAddresses.find(i=> i.type === 'PRIMARY').ipAddress,
    connectionName, databaseVersion 
    })
//   console.log(res.data.items.some(({name, state}) => name ==='my-test33' && state === 'PENDING_CREATE'))


}

*/

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager')
const { google } = require('googleapis')
const { randomWithPrefix } = require('./lib/utils/utils')

/**
 * TODO(developer): Uncomment these variables before running the sample.
 */
const parent = 'projects/corvid-managed-cfe9809c' // Project for which to manage secrets.
const secretId = 'foo' // Secret ID.
const payload = 'hello world!' // String source data.


async function main() {

    const serviceAccount = {
        projectId: 'corvid-managed-cfe9809c',
        email: 'script-user@corvid-managed-cfe9809c.iam.gserviceaccount.com',
        key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCv1c6B07t1QRzd\nxUmU38xuvQn2XNlY13aBHBm6nIXJHvt1iAO04lmKrcnPtZxnU/Q2bMz6HVcOrlWk\nReou7ATEHdL/6erFM7pav24vi+N99hSRv3OzBpEjXpZbvQnW9HuAbtbSmk2IlFSz\n1WhLzkLl1cib0P9JqcKLz8Uw/Bq6cmyJr2jh8jiiJ1E1y8z7nK2992DLCWQ8QnJ9\nk5ujXvvdQgIOTjC9ATEpfktOSXltvmOYBJoGLFzoDK1ipW+w+5U6ppHIsPWOIJdU\nL49yQuHXL3SjxvffcXN/OhXfBob917MSzktb+7c+KO90i6bPs1DYOckVSCSxTytc\n0YqpsnzzAgMBAAECggEAD6xS2aGs45kSi0tgRq6Ng2Vtnjx30dfKzrFZiG0WmRnI\n4kNlyS7P5Ruekdl8qn0s7IOq4F8oeRIzEg8lU69isV8ohU/YHGHYVOnGrDhKO9pp\nH6CyyHISZ9ZbjVZ+ql66eh/nHXihkUYKKB7NSsyE4VsP+aDvJdAa8Olr3fTq0P7n\njLKD0djNGS0pKwpup2CzyKbs3tlMFpgX7ugnHw4IlJU2WbD6ro4kC+6Y3pKABIAr\ntvRLBHEB6g+07SkLqZA7sipCPmzCuguMDPj+EsoYFCO3s7OFZMi05oGlQRAW1bn0\nGt1gyKaW0hnqJPtaLNmkAR6meWYDbj5vOc5URlKyYQKBgQDYKUQvsnprqneoZ4aP\nk2deRnEtUuvc7cUz51KToLbM7GrL7agkvTIpU1O5+XEAi1Ykk/K5sdYfBOW/qYjT\nkKm1ezmqwXiblzPu2wQvgA5t+/vHsmJ2rbZ1Is/1cmWrTArqG7eWG7YmI9nIYJvS\nH8y4g5wMQgAypAKf1v3lyTjzAwKBgQDQPemhYYQWj+bVCyxCbQNfzCFTmff5kqQM\ndAn8/LCzds1pn7igSbAJMSEjy6JEMcM6ZPZfCJ/C5uw//99pTv76gZfNTaTHG3JB\nhlCBbALdfSqYtSBElpAiQeRrEV+jpyGIHW1n0HotfebI0aPR7pcqK3PCHHV4ebGu\nyjIYC2wzUQKBgF5rsCgxiv4KqVf7WLDQj3+Dv54vsW2AwvpIGi74LcFXp9LKTf82\nUXnxtwnuZqj5NDioE4d/oetMxVqyIF1hvG/Ukrz+48L7CilUrABfrG3oevOg/Reg\nC6og+bvaK4Tmo4Hdd5TvJ+KDGHdJk+b2EwOqIXjNP67fK3JMg/1ipyinAoGAIGTx\nOjSkSqo6G3wwd2jj9HwZ1xqFk+J2+KT4hM1+Y3ygucSqAO1VoChvYlUkOf2PxD6+\ngMwjpjssF0yjoYszaR7N0Zc5gevIG19cmLWHwJLfFIBgs6rEYz/i27EJMrkmIzmI\nsnSg/QCv7R+Hn3nBNEMsL88jiwlLVciIgGsOevECgYEAhLeC4h1Xck/W8m835yux\nOaHHojYvz04i2x0UK0sZP44BmS4KDaz+RKF1UkUhvmvcf+H7Zu1DdAkHCprnwAyq\nFlzLxGxYV7HjuF306lNi1Ulyl3XrfiIK7fPU8pLo2vscTag8R2m8SF7YJKXqKLpY\njkav2NUF3TA+nxMoDB3eijE=\n-----END PRIVATE KEY-----\n',
    }


    // const client = new SecretManagerServiceClient({ credentials : { client_email: serviceAccount.email, private_key: serviceAccount.key }})


    // const projectId2 = await client.getProjectId()

    // console.log(projectId2);

    // const [secret] = await client.createSecret({
    //     parent: `projects/${projectId2}`,
    //     secretId: 'my-secret4',
    //     secret: {
    //         labels: {
    //             script : 'velo'
    //         },
        //   replication: {
        //     automatic: {},
        //   },
    
          
    //     },
        
    //   });

    //   const [version] = await client.addSecretVersion({
    //     parent: secret.name,
    //     payload: {
    //       data: Buffer.from(payload, 'utf8'),
    //     },
    //   });

    //  console.log(secret,version);

    /*
    const client = new SecretManagerServiceClient({ credentials : { client_email: serviceAccount.email, private_key: serviceAccount.key }})
    const projectId = await client.getProjectId()

    const config = { dbUser: 'root', dbPasswd: 'dbpass1', connectionName: 'conn', dbName: 'myDb', secretKey: 'secretKey' }

    for (const configItem of Object.keys(config)) {
        const [secret] = await client.createSecret({
            parent: `projects/${projectId}`,
            secretId: `velo-external3-${configItem}`,
            secret: {   
                labels: {
                    component: 'velo-external-adapter'
                },       
                replication: {
                    automatic: {}
                }
            }
        })

        await client.addSecretVersion({ 
            parent: secret.name, 
            payload: { data: config[configItem] } 
        })

        console.log(`velo-external-${configItem} created!`)
    } 

    const auth = new GoogleAuth({
        credentials: {
          client_email: serviceAccount.email,
          private_key: serviceAccount.key
        },
        scopes: 'https://www.googleapis.com/auth/cloud-platform'
    })

    const client = await auth.getClient()
    const projectId = await auth.getProjectId()
    const endpoint = 'us-central1-run.googleapis.com'

    // // '?dryRun=true'

    const url = `https://us-central1-run.googleapis.com/apis/serving.knative.dev/v1/namespaces/${projectId}/services/`

    // const data =   {
    //     apiVersion: 'serving.knative.dev/v1',
    //     kind: 'Service',
    //     metadata: {
    //       name: 'velo-external-db12',
    //       namespace: '983990708453',
    //       labels: { 'cloud.googleapis.com/location': 'us-central1' },
    //       annotations: {
    //         'run.googleapis.com/client-name': 'cloud-console',
    //         'serving.knative.dev/creator': 'idokah@wix.com',
    //         'serving.knative.dev/lastModifier': 'idokah@wix.com',
    //         'client.knative.dev/user-image': 'gcr.io/corvid-managed-cfe9809c/test@sha256:257fbb4fe007ec1d89a7ee0a528b1ba9246961f0f9e2a14097db2b70436eb7cc',
    //         'run.googleapis.com/ingress': 'all',
    //         'run.googleapis.com/ingress-status': 'all'
    //     }
    //     },
    //     spec: {
    //         'serviceAccountName': '983990708453-compute@developer.gserviceaccount.com',
    //         'containers': [
    //             {
    //                 'image': 'gcr.io/corvid-managed-cfe9809c/test@sha256:257fbb4fe007ec1d89a7ee0a528b1ba9246961f0f9e2a14097db2b70436eb7cc',
    //                 'ports': [
    //                     {
    //                         'name': 'http1',
    //                         'containerPort': 8080
    //                     }
    //                 ]
    //             }],
    //         template: {},
    //         traffic: []
    //     },
    //     status: {
    //     }
    //   }

    const data = {
        'apiVersion': 'serving.knative.dev/v1',
        'kind': 'Service',
        'metadata': {
          'annotations': {
            'run.googleapis.com/launch-stage' : 'BETA'
          },
          'name': randomWithPrefix('service'),
          'namespace': projectId
        },
        'spec': {
          'template': {
            'metadata': {
              'annotations': {
                'run.googleapis.com/cloudsql-instances': 'corvid-managed-cfe9809c:us-central1:velo-external-db-development',
              }
            },
            'spec': {
                'containers': [
                    {
                        'image': 'gcr.io/corvid-managed-cfe9809c/test@sha256:257fbb4fe007ec1d89a7ee0a528b1ba9246961f0f9e2a14097db2b70436eb7cc',
                        'env': [
                            {
                                'name': 'DB',
                                'valueFrom': {
                                    'secretKeyRef': {
                                        'key': 'latest',
                                        'name': 'velo-external-USER-7209'
                                    }
                                }
                            },
                        ]
                    }
                ]
            }
          }
        }
      }



      
      // console.log(res.data)
      
      
      const res = await client.request({ url, method: 'POST', data })

      console.log(res);
      
    //   const res = await client.request({ url })
    //   console.log (JSON.stringify((res.data.items[4])))

    // console.log(res.data.items.map(i => JSON.stringify(i.spec)));


*/

    const {GoogleAuth} = require('google-auth-library')
    const AdapterImageUrl = 'gcr.io/wix-velo-api/velo-external-db'

    class AdapterProvision {
        constructor(credentials, region) {
            this.authClient = new GoogleAuth({
                credentials : { client_email: credentials.email, private_key: credentials.key },
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

            const env = [
                { name: 'CLOUD_VENDOR', value: 'gcp' },
                { name: 'TYPE', value: engine },
                // ...this.secretsToEnvs(secrets)
            ]

            const adapterInstanceProperties = {

                apiVersion: 'serving.knative.dev/v1',
                kind: 'Service',
                metadata: {
                annotations: {
                    'run.googleapis.com/client-name': 'gcloud',
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
                            serviceAccountName : 'velo-external-db-adapter-postg@corvid-managed-cfe9809c.iam.gserviceaccount.com',
                            containers: [
                            { image: AdapterImageUrl, env }
                        ]
                    }
                }
                },
                'status': {
                    'address': {}
                  }
            }

            // const res = await client.request({ url: apiUrl, method: 'POST', data: adapterInstanceProperties })

            const sa = 'mytestforsa@corvid-managed-cfe9809c.iam.gserviceaccount.com'


            const apiUrl2 = `https://run.googleapis.com/v1/projects/${projectId}/locations/us-central1/services/${projectId}:setIamPolicy`

            const data2 = {
                'policy': {
                  'bindings': [
                    {
                      'members': [
                        'allUsers'
                      ],
                      'role': 'roles/run.invoker'
                    },
                                      {
                    'role': 'roles/owner',
                    'members': [ `serviceAccount:${sa}` ]
                  }
                  ],
                  'etag': 'ACAB'
                }
              }

            const res2 = await client.request({ url: apiUrl2, method:'POST', data: data2})
            console.log(res2.data.bindings);
            
            // const sa = 'mytestforsa@corvid-managed-cfe9809c.iam.gserviceaccount.com'
            // const apiUrl3 = `https://iam.googleapis.com/v1/projects/${projectId}:setIamPolicy`
            // const data3 = {
            //     'policy': {
            //     'bindings': [
            //       {
            //         'role': 'roles/owner',
            //         'members': [ `serviceAccount:${sa}` ]
            //       }
            //     ]
            //   }
            // }

            // const res3 = await client.request({ url: apiUrl3, method: 'POST', data: data3 })

            // console.log(res3 );


        }

        async adapterStatus(serviceId) {
        }

        async rdsRoleArn() {
        }
    }


    const adapterProvision = new AdapterProvision(serviceAccount, 'us-central1')
    const secrets = {
        USER: 'velo-external-USER-4920',
        PASSWORD: 'velo-external-PASSWORD-1175',
        CLOUD_SQL_CONNECTION_NAME: 'velo-external-CLOUD_SQL_CONNECTION_NAME-6222',
        DB: 'velo-external-DB-2498',
        SECRET_KEY: 'velo-external-SECRET_KEY-506'
      }
    await adapterProvision.createAdapter('myserv008', 'postgres', secrets, 'velo-external-db-5055')




}

main().catch(console.error)