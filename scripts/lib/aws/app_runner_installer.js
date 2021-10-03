const { AppRunnerClient, CreateServiceCommand, DescribeServiceCommand } = require('@aws-sdk/client-apprunner')

const AdapterImageUrl = 'public.ecr.aws/p2z5s3h8/wix-velo/velo-external-db'

class AdapterProvision {
    constructor(credentials) {
        this.client = new AppRunnerClient( { region: 'us-east-2',
                                          credentials: { accessKeyId: credentials.awsAccessKeyId,
                                                         secretAccessKey: credentials.awsSecretAccessKey } } )
    }

    async createAdapter(name, ) {
        const response = await this.client.send(new CreateServiceCommand({ ServiceName: name,
                                                                                 AuthenticationConfiguration: {},
                                                                                 SourceConfiguration: {
                                                                                     ImageRepository: {
                                                                                         ImageIdentifier: AdapterImageUrl,
                                                                                         ImageRepositoryType: 'ECR',
                                                                                         ImageConfiguration: {
                                                                                             RuntimeEnvironmentVariables: {
                                                                                                 'CLOUD_VENDOR': 'aws',
                                                                                                 'TYPE': 'mysql',
                                                                                     } } },
                                                                                     AuthenticationConfiguration: {
                                                                                         AccessRoleArn: 'AccessRoleArn' // ???
                                                                                 } }
                                                                               } ) )
        return { serviceId: response.Service.ServiceArn }
    }

    async adapterStatus(serviceId) {
        const res = await this.client.send(new DescribeServiceCommand({ ServiceArn: serviceId }))
        return {
            available: res.Service.Status === 'RUNNING',
            serviceUrl: res.Service.ServiceUrl
        }
    }
}


module.exports = AdapterProvision