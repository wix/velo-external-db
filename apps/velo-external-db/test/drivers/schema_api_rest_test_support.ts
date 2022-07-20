import { InputField } from "@wix-velo/velo-external-db-types"

const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
})

export const givenCollection = async(name: string, columns: InputField[], auth: any) => {
    await axios.post('/schemas/create', { collectionName: name }, auth)
    for (const column of columns) {
        await axios.post('/schemas/column/add', { collectionName: name, column: column }, auth)
    }
}

export const retrieveSchemaFor = async(collectionName: string, auth: any) => axios.post('/schemas/find', { schemaIds: [collectionName] }, auth)
