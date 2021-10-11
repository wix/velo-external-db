const Spinner = require('cli-spinner').Spinner
const { green, grey, greenBright, redBright } = require('chalk')

const startSpinnerWith = async (msg, f, completeMsg) => {
    const spinner = new Spinner({
        text: `\t\t %s ${msg}`,
        stream: process.stderr,
        onTick: function(msg){
            this.clearLine(this.stream);
            this.stream.write(msg);
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
        process.stderr.write(e)
        process.exit(1)
    }

}
/*

await startSpinnerWith(`Creating demo collection`, () => createCollection('demo_collection', secretKey, serviceUrl))
    console.log('')
    console.log('')
    console.log(`${green('[INFO]:')} Provision Cloud Sql and Cloud Run instances using Wix GCP`)

 */

const info = msg => console.log(`${green('[INFO]:')} ${msg}`)
const blankLine = () => console.log('')

module.exports = { startSpinnerWith, info, blankLine }