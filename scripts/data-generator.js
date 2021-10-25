
const { askForUserInput } = require('./data-generator-user-input')
const { main } = require('./data-generator-provision')


const process = async() => {
    const userInputs = await askForUserInput()
    await main(userInputs)
}

process()