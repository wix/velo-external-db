import axios from 'axios'
import { InputField } from '@wix-velo/velo-external-db-types'
import { streamToArray } from '@wix-velo/test-commons'

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080'
})

export const givenCollection = async(name: string, columns: InputField[], auth: any) => {
    await axiosClient.post('/schemas/create', { collectionName: name }, auth)
    for (const column of columns) {
        await axiosClient.post('/schemas/column/add', { collectionName: name, column: column }, auth)
    }
}

export const givenNewCollection = async(name: string, columns: InputField[], auth: any) => {
    const collection = {
        id: name,
        // todo: add convert the type to enum value dynamically
        fields: columns.map(c => ({ key: c.name, type: 0 }))
    }
    await axiosClient.post('/collections/create', { collection }, { ...auth, responseType: 'stream' })
}

export const deleteAllCollections = async(auth: any) => {
    const res = await axiosClient.post('/collections/get', { collectionIds: [] }, { ...auth, responseType: 'stream' })
    const dataRes = await streamToArray(res.data) as any []
    const collectionIds = dataRes.map(d => d.id)

    for (const collectionId of collectionIds) {
        await axiosClient.post('/collections/delete', { collectionId }, { ...auth, responseType: 'stream' })
    }

}

export const retrieveSchemaFor = async(collectionName: string, auth: any) => axiosClient.post('/schemas/find', { schemaIds: [collectionName] }, auth)
