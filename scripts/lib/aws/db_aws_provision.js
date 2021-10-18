const { RDSClient, CreateDBInstanceCommand, DescribeDBInstancesCommand, waitUntilDBInstanceAvailable } = require('@aws-sdk/client-rds')
const { EC2Client, DescribeSecurityGroupsCommand, AuthorizeClientVpnIngressCommand } = require('@aws-sdk/client-ec2')
const factory = require('./db/factory')

class DbProvision {
    constructor(credentials, region) {
        this.rdsClient = new RDSClient( { region: region,
                                          credentials: { accessKeyId: credentials.awsAccessKeyId,
                                                         secretAccessKey: credentials.awsSecretAccessKey } } )
        this.ec2Client = new EC2Client({ region: region })
    }

    async createDb( { name, engine, credentials }) {
        const response = await this.rdsClient.send(new CreateDBInstanceCommand({ Engine: engine, DBInstanceClass: 'db.t3.micro', AllocatedStorage: 20,
                                                                                       DBInstanceIdentifier: name,
                                                                                       MasterUsername: credentials.user, MasterUserPassword: credentials.passwd }))
        return response['$metadata']['httpStatusCode'] === 200
    }

    async dbStatusAvailable(name) {
        // todo: use waitUntilDBInstanceAvailable
        const response = await this.rdsClient.send(new DescribeDBInstancesCommand({ DBInstanceIdentifier: name }))

        const instance = response.DBInstances[0]
        return {
            host: instance.Endpoint.Address,
            port: instance.Endpoint.Port,
            securityGroupId: instance.VpcSecurityGroups[0].VpcSecurityGroupId,
            available: instance.DBInstanceStatus === 'available'
        }
    }

    async postCreateDb(engine, dbName, status, credentials) {
        await factory.clientFor(engine)
                     .createDatabase(dbName, status.host, credentials)
    }

    async addSecurityRule(groupId, port) {
        const sgs = await this.ec2Client.send(new DescribeSecurityGroupsCommand({ GroupIds: [groupId] }))
        const sg = sgs.SecurityGroups[0]
        if (!sg.IpPermissions.some(p => p.FromPort >= port && p.ToPort >= port)) {
            console.log('please add rule')
            //authorize-security-group-ingress
            const rsp = await this.ec2Client.send(new AuthorizeClientVpnIngressCommand({
                GroupId: sg.GroupId,
                IpPermissions: [ { FromPort: port, ToPort: port,
                    IpProtocol: 'tcp',
                    IpRanges: [ { CidrIp: '0.0.0.0/0' }
                    ] } ] }))
            console.log(rsp)
        }
    }
}


module.exports = DbProvision