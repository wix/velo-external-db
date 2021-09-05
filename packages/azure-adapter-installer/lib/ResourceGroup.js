const { ResourceManagementClientContext, ResourceGroups } = require("@azure/arm-resources");

const createResourceGroup = async (creds, subscriptionId, resourceGroupName) => {
    return new Promise(async (resolve, reject) => {
        try {
            const resourceManagementClientContext = new ResourceManagementClientContext(creds, subscriptionId);
            const resourceGroupsClient = new ResourceGroups(resourceManagementClientContext);
            const resourceGroup = await resourceGroupsClient.createOrUpdate(resourceGroupName, { "location": "eastus" })
            resolve(resourceGroup);
        } catch (e) {
            console.log("error creating resource group");
            reject(e)
        }
    })
}

module.exports = { createResourceGroup }
