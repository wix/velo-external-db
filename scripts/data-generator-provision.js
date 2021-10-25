const Chance = require('chance')
const axios = require('axios')
const chalk = require('chalk')
const cliProgress = require('cli-progress')
const chance = Chance()

const generateColumns = (columnsCount) => {
    return [...Array(parseInt(columnsCount))].map(() => ({name: chance.word(), type: 'text', subtype: 'string', precision: '256', isPrimary: false}))
}

const newDate = () => {
    const d = new Date()
    d.setMilliseconds(0)
    return d
}

const veloDate = () => ( { $date: newDate().toISOString() } )

const randomEntity = (columns) => {
    const entity = {
        _id: chance.guid(),
        _createdDate: veloDate(),
        _updatedDate: veloDate(),
        _owner: chance.guid(),
    }

    const _columns = columns || []

    for (const column of _columns) {
        entity[column.name] = chance.word()
    }
    return entity
}

const appendSecretKeyRoleToRequest = (data, role, secretKey) => ({
    ...data,
    requestContext: {
        role,
        settings: { secretKey }
    }
})

const createAxiosClient = ({adaptorUrl, adaptorSecretKey, role}) => {
    return axios.create({
        baseURL: adaptorUrl,
        transformRequest: [
            (data, headers) => appendSecretKeyRoleToRequest(data, role, adaptorSecretKey),
            ...axios.defaults.transformRequest]
    })
}

const createCollection = async(collectionName, axiosClient) => {
    console.log('Creating new collection ...')
    try{
        await axiosClient.post('/schemas/create', { collectionName })
        console.log('The collection was created successfully')
    } catch (error) {
        console.log(`Error creating new collection: ${error.response.data.message}`)
    }
}

const addColumnsToCollection = async(collectionName, newColumns, axiosClient) => {
    console.log('Adding new columns to the collection ...')
    try{
        await Promise.all(newColumns.map(column => axiosClient.post('/schemas/column/add', { collectionName, column })))
        console.log('The columns were added successfully')
    } catch (error) {
        console.log(`Error adding new columns: ${error.response.data.message}`)
    }
}

const insertItems = async(generatedRowCount, generatedColumns, collectionName, axiosClient) => {
    console.log(`Adding ${generatedRowCount} new items to the collection ...`)
    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.rect)
    const itemsPerChunk = 100

    bar.start(generatedRowCount, 0)

    for (let i = 0; i < generatedRowCount; i+= itemsPerChunk) {
        const items = [...Array(itemsPerChunk)].map(() => (randomEntity(generatedColumns)))
        try {
            await axiosClient.post('/data/insert/bulk', { collectionName, items })
        } catch (error) {
            console.log(`Error adding chunk ${i+1}: ${error.message}`)
        }
        bar.update(itemsPerChunk + i)
    }
    bar.stop()
    console.log(chalk.green(`${generatedRowCount} items were added successfully`))
}

const main = async(userInputs) => {
    const axiosClient = createAxiosClient({...userInputs, role: 'OWNER'})
    await createCollection(userInputs.collectionName, axiosClient)
    const generatedColumns = generateColumns(userInputs.additionalColumnsCount)
    await addColumnsToCollection(userInputs.collectionName, generatedColumns, axiosClient)
    await insertItems(userInputs.generatedRowCount, generatedColumns, userInputs.collectionName, axiosClient)
}


module.exports = { main }