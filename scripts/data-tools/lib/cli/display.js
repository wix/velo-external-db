const Spinner = require('cli-spinner').Spinner
const { green, grey, greenBright, redBright } = require('chalk')
const cliProgress = require('cli-progress')
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

const startProgress = async(msg, iterations, f) => {
    const bar = new cliProgress.SingleBar({ format: `\t\t ${msg} [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}` }, cliProgress.Presets.rect)
    bar.start(iterations, 0)

    for (let i = 0; i < iterations; i++) {
        await f()
        bar.increment(1)
    }
    bar.stop()

}

const info = msg => console.log(`${green('[INFO]:')} ${msg}`)
const blankLine = () => console.log('')

const header = async() => {
    blankLine()
    await showBanner('Velo External DB', 'Data Generator', 'blue', 'magenta')
    blankLine()
    blankLine()
}

module.exports = { startSpinnerWith, info, blankLine, startProgress, header }
