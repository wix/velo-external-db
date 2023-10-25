import axios from 'axios'
import { InputField } from '@wix-velo/velo-external-db-types'
import { schemaUtils } from '@wix-velo/velo-external-db-core'


const axiosClient = axios.create({
    baseURL: 'http://localhost:8080'
})

export const givenCollection = async(name: string, columns: InputField[], auth: any) => {
    const collection = {
        id: name,
        fields: columns.map(schemaUtils.InputFieldToWixFormatField)
    }
    await axiosClient.post('/collections/create', { collection }, auth)
}

export const deleteAllCollections = async(auth: any) => {
    const { data } = await axiosClient.post('/collections/get', { collectionIds: [] }, auth)
    const collectionIds = data.collections.map(d => d.id)

    for (const collectionId of collectionIds) {
        await axiosClient.post('/collections/delete', { collectionId }, auth)
    }

}

export const retrieveSchemaFor = async(collectionName: string, auth: any) => {
    const collectionGetStream = await axiosClient.post('/collections/get', { collectionIds: [collectionName] }, auth)
    return collectionGetStream.data.collections[0]
}

export const retrieveAllCollections = async(auth: any) => {
    const collectionGetStream = await axiosClient.post('/collections/get', { collectionIds: [] }, auth)
    return collectionGetStream.data.collections
}
