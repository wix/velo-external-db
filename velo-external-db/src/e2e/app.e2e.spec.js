const {expect} = require('chai')
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
        expect((await axios.get(`/`)).data).to.be.eql('ok');
    })
})
