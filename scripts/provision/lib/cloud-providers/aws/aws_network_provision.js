const { EC2Client, DescribeSecurityGroupsCommand, AuthorizeSecurityGroupIngressCommand, RevokeSecurityGroupIngressCommand } = require('@aws-sdk/client-ec2')

class NetworkProvision {
    constructor(credentials, region) {
        this.ec2Client = new EC2Client({ region })
    }

    async addSecurityRule(groupId, port) {
        const sgs = await this.ec2Client.send(new DescribeSecurityGroupsCommand({ GroupIds: [groupId] }))
        const sg = sgs.SecurityGroups[0]
        if (!sg.IpPermissions.some(p => p.FromPort >= port && p.ToPort >= port)) {
            const rsp = await this.ec2Client.send(new AuthorizeSecurityGroupIngressCommand({
                GroupId: sg.GroupId,
                IpPermissions: [ { FromPort: port, ToPort: port,
                    IpProtocol: 'tcp',
                    IpRanges: [ { CidrIp: '0.0.0.0/0' }
                    ] } ] }))
            return [ rsp.SecurityGroupRules[0].SecurityGroupRuleId ]
        }
        return []
    }

    async removeSecurityRule(groupId, securityGroupRuleIds) {
        if (securityGroupRuleIds.length > 0) {
            await this.ec2Client.send(new RevokeSecurityGroupIngressCommand({
                GroupId: groupId,
                SecurityGroupRuleIds: securityGroupRuleIds,
            }))
        }
    }
}

module.exports = NetworkProvision
