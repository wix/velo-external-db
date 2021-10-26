const { askForUserInput } = require('./lib/cli/user-input')
const { main } = require('./lib/core/provision')

const process = async() => {
    const userInput = await askForUserInput()
    await main(userInput)
}

process()