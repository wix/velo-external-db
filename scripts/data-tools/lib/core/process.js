const chalk = require('chalk')
const cliProgress = require('cli-progress')
const { randomEntity } = require('../generator/data')

const insert = async (items, axios) => {
    await axios.post('/data/insert/bulk', { collectionName, items })
               .catch(error => console.log(`Error adding chunk ${i+1}: ${error.message}`))
}

const insertItems = async(generatedRowCount, generatedColumns, collectionName, axios) => {
    console.log(`Adding ${generatedRowCount} new items to the collection ...`)
    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.rect)
    const itemsPerChunk = 100

    bar.start(generatedRowCount, 0)

    for (let i = 0; i < generatedRowCount; i+= itemsPerChunk) {
        const items = [...Array(itemsPerChunk)].map(() => (randomEntity(generatedColumns)))
        await insert(items, axios)
        bar.update(itemsPerChunk + i)
    }
    bar.stop()
    console.log(chalk.green(`${generatedRowCount} items were added successfully`))
}


module.exports = { insertItems }