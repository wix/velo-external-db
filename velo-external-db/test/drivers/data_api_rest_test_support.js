const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
});

const givenItems = async (items, collectionName, auth) => await axios.post(`/data/insert/bulk`, {collectionName: collectionName, items: items }, auth)

const expectAllDataIn = async (collectionName, auth) => (await axios.post(`/data/find`, {collectionName: collectionName, filter: '', sort: '', skip: 0, limit: 25 }, auth)).data

module.exports = { givenItems, expectAllDataIn }
