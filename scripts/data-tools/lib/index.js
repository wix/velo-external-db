const { askForUserInput } = require('./cli/user-input')
const { main } = require('./core/process')
const { blankLine, header } = require('./cli/display')

const process = async() => {
    await header()
    const userInput = await askForUserInput()
    blankLine()
    blankLine()
    await main(userInput)
}

process()
