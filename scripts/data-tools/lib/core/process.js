const chalk = require('chalk')
const cliProgress = require('cli-progress')
const { randomEntity } = require('../generator/data')

const insert = async (items, collectionName, chunk, axios) => {
    await axios.post('/data/insert/bulk', { collectionName, items })
               .catch(error => console.log(`Error adding chunk ${chunk + 1}: ${error.message}`))
}

const insertItems = async(rowCount, generatedColumns, collectionName, axios) => {
    console.log(`Adding ${rowCount} new items to the collection ...`)
    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.rect)
    const itemsPerChunk = 100

    bar.start(rowCount, 0)

    for (let i = 0; i < rowCount; i+= itemsPerChunk) {
        const items = [...Array(itemsPerChunk)].map(() => (randomEntity(generatedColumns)))
        await insert(items, collectionName, i, axios)
        bar.update(itemsPerChunk + i)
    }
    bar.stop()
    console.log(chalk.green(`${rowCount} items were added successfully`))
}


module.exports = { insertItems }