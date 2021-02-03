const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
});

const givenItems = async (items, collectionName) => await Promise.all( items.map(async item => await axios.post(`/data/insert`, {collectionName: collectionName, item: item })) )

const expectAllDataIn = async (collectionName) => (await axios.post(`/data/find`, {collectionName: collectionName, filter: '', sort: '', skip: 0, limit: 25 })).data

module.exports = { givenItems, expectAllDataIn }
