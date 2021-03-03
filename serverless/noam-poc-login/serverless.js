const {WixMetaSiteManagerWebapp} = require('@wix/ambassador-wix-meta-site-manager-webapp/rpc');
const {FullHttpResponse, HttpError} = require('@wix/serverless-api');
const { get } = require('lodash');

const metaSiteManagerApi = WixMetaSiteManagerWebapp().MetaSiteManagerApi();

const signedInstanceFor = async (msId, ctx) => {

    const resp = await metaSiteManagerApi(ctx.aspects).fetchEditorClientSpecMap(msId)

    return resp['-666'];
}

const getUserGuid = async (ctx) => {
    const context = await ctx.apiGatewayClient.contextV2();
    const identities = get(context, 'identityResponse.identificationData.identities', []);
    return identities.filter((identity) => identity.person).map((identity) => identity.person.id)[0]
};


const acl = ['eb633178-4b9d-4282-9ce0-4518ebe6b202']

const verifyUserIsLoggedIn = async (ctx) => {
    try {
        const userId = await getUserGuid(ctx);
        if (!userId || !acl.includes(userId)) {
            const myException = new HttpError({status: 403, message: 'User Not Permitted to edit this app'});
            ctx.logger.info(`webhooks-playground: session not found. throwing: ${JSON.stringify((myException))}`);
            return {
                loggedIn: false,
                message: `User Not Permitted to edit this app ${!acl.includes(userId)}`
            };
        } else {
            return { loggedIn: true, message: '' };
        }

    }
    catch (exception) {
        return new FullHttpResponse({
            status: 500, body: `test webhooks failed with: ${exception.message}`
        })
    }

}


module.exports = (functionsBuilder) => {
    return functionsBuilder
        .withContextPath('noam-poc-login')
        .addWebFunction('GET', '/instance', async (ctx, req) => {
            const s = await verifyUserIsLoggedIn(ctx)
            if (!s.loggedIn) {
                return new FullHttpResponse({
                    status: 500, body: `bye bye ${s}`
                })
            }
            const msId = req.params['msId']

            const res = await signedInstanceFor(msId, ctx)
            return res
        })
};


