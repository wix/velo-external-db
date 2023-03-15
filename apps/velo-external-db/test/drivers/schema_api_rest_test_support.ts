import axios from 'axios'
import { InputField } from '@wix-velo/velo-external-db-types'
import { streamToArray } from '@wix-velo/test-commons'
import { schemaUtils } from '@wix-velo/velo-external-db-core'


const axiosClient = axios.create({
    baseURL: 'http://localhost:8080'
})

export const givenCollection = async(name: string, columns: InputField[], auth: any) => {
    const collection = {
        id: name,
        fields: columns.map(schemaUtils.InputFieldToWixFormatField)
    }
    await axiosClient.post('/collections/create', { collection }, { ...auth, responseType: 'stream' })
}

export const deleteAllCollections = async(auth: any) => {
    const res = await axiosClient.post('/collections/get', { collectionIds: [] }, { ...auth, responseType: 'stream' })
    const dataRes = await streamToArray(res.data) as any []
    const collectionIds = dataRes.map(d => d.collection.id)

    for (const collectionId of collectionIds) {
        await axiosClient.post('/collections/delete', { collectionId }, { ...auth, responseType: 'stream' })
    }

}

export const retrieveSchemaFor = async(collectionName: string, auth: any) => {
    const collectionGetStream = await axiosClient.post('/collections/get', { collectionIds: [collectionName] }, { ...auth, responseType: 'stream' })
    const [collectionGetRes] = await streamToArray(collectionGetStream.data) as any[]
    return collectionGetRes
}

export const retrieveAllCollections = async(auth: any) => {
    const collectionGetStream = await axiosClient.post('/collections/get', { collectionIds: [] }, { ...auth, responseType: 'stream' })
    return await streamToArray(collectionGetStream.data) as any[]
}
