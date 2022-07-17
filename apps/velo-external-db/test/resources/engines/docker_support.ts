import * as compose from 'docker-compose'

export const runImage = async(image: string, showLogs?: boolean) => {
    await compose.upOne(image, { cwd: __dirname, log: true, commandOptions: [['--force-recreate', '--remove-orphans']] })
    if (showLogs) {
        await compose.logs(image, { cwd: __dirname, log: true })
    }
}
export const stopImage = async(image: string) => await compose.stopOne(image, { cwd: __dirname, log: true })
