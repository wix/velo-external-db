const Spinner = require('cli-spinner').Spinner
const { green, grey, greenBright, redBright } = require('chalk')
const showBanner = require('node-banner')

const startSpinnerWith = async(msg, f, completeMsg) => {
    const spinner = new Spinner({
        text: `\t\t %s ${msg}`,
        stream: process.stderr,
        onTick(msg) {
            this.clearLine(this.stream)
            this.stream.write(msg)
        }
    })

    spinner.setSpinnerString(18)

    spinner.start()

    try {
        const res = await f()

        spinner.stop(true)

        process.stderr.write(`\t\t ${greenBright('✓')} ${grey(completeMsg || msg)}\n`)

        return res
    } catch (e) {
        spinner.stop(true)
        process.stderr.write(`\t\t ${redBright('✓')} ${grey(completeMsg || msg)}\n`)
        process.stderr.write(redBright('Process failed\n'))
        console.error(e)
        process.exit(1)
    }

}

const info = msg => console.log(`${green('[INFO]:')} ${msg}`)
const blankLine = () => console.log('')

const header = async() => {
    blankLine()
    await showBanner('Velo External DB', 'Adapter and DB Provision', 'blue', 'magenta')
    blankLine()
    blankLine()
}


module.exports = { startSpinnerWith, info, blankLine, header }
