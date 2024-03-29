module.exports = async ({github, context, core}) => {
    const execSync = require('child_process').execSync

    const { version } = context.payload.inputs
    delete context.payload.inputs.version

    for (const [packageName, toUpdate] of Object.entries(context.payload.inputs)) {
        console.log({ [packageName]: toUpdate })
        if (toUpdate == 'true') {
            const result = execSync(`nx run @${packageName}:publish --ver=${version}`).toString()
            console.log({ result })
        }
    }

}