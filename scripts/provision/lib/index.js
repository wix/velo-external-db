const { askForUserInput } = require('./cli/user-input')
const { main } = require('./core/provision')

const process = async() => {
    const userInput = await askForUserInput()
    await main(userInput)
}

process()