const { AppRunnerClient, CreateServiceCommand, DescribeServiceCommand } = require('@aws-sdk/client-apprunner')
const { IAMClient, ListRolesCommand } = require('@aws-sdk/client-iam')
const AdapterImageUrl = 'public.ecr.aws/p2z5s3h8/wix-velo/velo-external-db:latest'

class AdapterProvision {
    constructor(credentials, region) {
        this.region = region
        this.client = new AppRunnerClient( { region,
                                             credentials: { accessKeyId: credentials.awsAccessKeyId,
                                                            secretAccessKey: credentials.awsSecretAccessKey } } )

        this.clientIAM = new IAMClient({ region: 'us-east-2' })
    }

    async createAdapter(name, engine, secretId) {
        const rdsRole = await this.rdsRoleArn()
        const response = await this.client.send(new CreateServiceCommand({ ServiceName: name,
                                                                                 AuthenticationConfiguration: {},
                                                                                 InstanceConfiguration: {
                                                                                     InstanceRoleArn: rdsRole,
                                                                                 },
                                                                                 SourceConfiguration: {
                                                                                     ImageRepository: {
                                                                                         ImageIdentifier: AdapterImageUrl,
                                                                                         ImageRepositoryType: 'ECR_PUBLIC',
                                                                                         ImageConfiguration: {
                                                                                             RuntimeEnvironmentVariables: {
                                                                                                 CLOUD_VENDOR: 'aws',
                                                                                                 TYPE: engine,
                                                                                                 SECRET_NAME: secretId,
                                                                                                 REGION: this.region,
                                                                                     } } },
                                                                               } } ) )
        return { serviceId: response.Service.ServiceArn }
    }

    async adapterStatus(serviceId) {
        const res = await this.client.send(new DescribeServiceCommand({ ServiceArn: serviceId }))
        return {
            available: res.Service.Status === 'RUNNING',
            serviceUrl: res.Service.ServiceUrl
        }
    }

    async rdsRoleArn() {
        const { Roles } = await this.clientIAM.send(new ListRolesCommand( { } ))
        const roles = Roles.filter(r => r.RoleName === 'AppRunnerRDSAccessRole')
        return roles[0].Arn
    }
}


module.exports = AdapterProvision
