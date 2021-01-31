const {expect} = require('chai')
//const chaiHttp = require('chai-http');

const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
});


describe('Velo External DB', () => {
    let server;

    before(() => {
        server = require('../app')
    });

    after((cb) => {
        server.close(cb)
    });


    it('answer default page with a welcoming response', async () => {
        expect((await axios.get(`/`)).data).to.contain('<!doctype html>');
    })

    it('find api e2e', async () => {
        expect((await axios.post(`/data/find`, {collectionName: 'collectionName', filter: '', sort: '', skip: 0, limit: 25 })).data).to.be.eql({items: [ { _id: 'stub'} ], totalCount: 0});
    })
})
