const {expect} = require('chai');
const axios = require('axios');
const {app, whenGrpcCalled} = require('@wix/serverless-testkit');
const {Uninitialized} = require('./commons/test-commons');
const wrapper = require('../generated/proto-generated');

describe.only('serverless REST e2e', function() {
    this.timeout(5000)

    const testkit = app('wordpress-external-db').beforeAndAfter(10000);

    // const env = {
    //     wordpressServiceClient: Uninitialized,
    // }
    //
    // const ctx = {
    //     aspects: Uninitialized,
    // }
    //
    // before(() => {
    //     env.wordpressServiceClient = testkit.grpcClient(wrapper.com.wixpress.wordpress.WordPressService, 10000);
    // });
    //
    // beforeEach(() => {
    //     ctx.aspects = testkit.apiGwTestkit.callContextBuilder().aspects()
    // });
    //
    // afterEach(() => {
    //     testkit.grpc.reset();
    // });

    context('wordpress serverless e2e', () => {

        it('provision should do nothing', async () => {
            const result = await axios.post(testkit.getUrl('/provision'));
            expect(result.data).to.deep.equal({});
        });

        it('list all schemas', async () => {
            const result = await axios.post(testkit.getUrl('/schemas/list'));
            expect(result.data).to.deep.equal({ schemas: [] });
        });

        it('find specific collection by id', async () => {
            const result = await axios.post(testkit.getUrl('/schemas/find'));
            expect(result.data).to.deep.equal({ schemas: [] });
        });

        // it.skip('check posts api', async () => {
        //     const resp = await env.wordpressServiceClient.posts(ctx.aspects, { what: 'ever'})
        //     expect(resp.posts).to.not.be.empty
        //
        // });
        //
        // it('check media api', async () => {
        //     const resp = await env.wordpressServiceClient.media(ctx.aspects, { what: 'ever'})
        //     expect(resp.media).to.not.be.empty
        // });
        //
        // it('check categories api', async () => {
        //     const resp = await env.wordpressServiceClient.categories(ctx.aspects, { what: 'ever'})
        //     expect(resp.categories).to.not.be.empty
        // });
    });
});
