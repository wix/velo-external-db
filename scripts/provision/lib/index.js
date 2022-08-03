const { askForUserInput } = require('./cli/user-input')
const { header } = require('./cli/display')
const { main } = require('./core/provision')

const process = async() => {
    await header()
    const userInput = await askForUserInput()
    await main(userInput)
}

process()
