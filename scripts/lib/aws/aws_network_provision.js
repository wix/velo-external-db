const { EC2Client, DescribeSecurityGroupsCommand, AuthorizeClientVpnIngressCommand } = require('@aws-sdk/client-ec2')

class NetworkProvision {
    constructor(credentials, region) {
        this.ec2Client = new EC2Client({ region: region })
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

module.exports = NetworkProvision