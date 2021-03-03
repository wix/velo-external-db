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
//eb633178-4b9d-4282-9ce0-4518ebe6b202

const verifyUserIsLoggedIn = async (ctx) => {
    try {
        const userId = await getUserGuid(ctx);
        // ctx.logger.info(`webhooks-playground: hasSession: ${hasSession}`);
        if (!userId && !acl.includes(userId)) {
            const myException = new HttpError({status: 403, message: 'User Not Permitted to edit this app'});
            ctx.logger.info(`webhooks-playground: session not found. throwing: ${JSON.stringify((myException))}`);
            // throw myException;
            return {
                loggedIn: false,
                message: 'User Not Permitted to edit this app'
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


module.exports = (functionsBuilder, initContext) => {
    const secret = initContext.getConfig('secret');
    // const wixServiceAppId = initContext.getConfig('wixServiceAppId');

    return functionsBuilder
        .withContextPath('noam-poc-login')
        // .addWebFunction('POST', '/get-webhook-url', async (ctx, req) => await webhookUrlFor(req.body.appId, req.body.slug, ctx))
        .addWebFunction('GET', '/instance', async (ctx, req) => {
            const s = await verifyUserIsLoggedIn(ctx)
            return s
            if (!s.loggedIn) {
                return new FullHttpResponse({
                    status: 500, body: `bye bye`
                })
            }

            const res = await signedInstanceFor('1b86b6b0-0d2c-4991-ac37-92f0268715d9', ctx)
            return res
            // const url = (await webhookUrlFor(req.body.appId, req.body.slug, ctx)).webhookCallbackUrl;
            // const webhookRequest = webhookRequestFor(url, secret);
            //
            // ctx.logger.info(`webhooks-playground: webhooks request: ${JSON.stringify(webhookRequest)}`);
            // const {statusCode, message} = await ctx.grpcClient(api.WebhooksDebugService, 'com.wixpress.iptf.webhooks-server')
            //                                        .submit(ctx.aspects, webhookRequest);
            // ctx.logger.info(`webhooks-playground: dispatch succeeded with status code: ${statusCode} and message: ${message}`)
            // return {statusCode, message}

        })
        // .addWebFunction('POST', '/generate-server-header', generateAuthHeader(secret, wixServiceAppId))
        // .addWebFunction('POST', '/get-user-guid-from-ctx', async (ctx, req) => { return await getUserGuid(ctx) })
};


