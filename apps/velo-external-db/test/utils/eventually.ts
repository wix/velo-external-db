import * as trier from 'trier-promise'

const defaults = {
    timeout: 5000,
    interval: 200
}

export const eventually = async(fn: any, opts?: { timeout?: number; interval?: number }) => {
    return Promise.resolve().then(() => {
        let error = null
        const action = () => Promise.resolve().then(fn).catch(err => {
            error = err
            throw err
        })
        const options = Object.assign({ action }, defaults, opts)

        return trier(options).catch(() => {
            if (error !== null) {
                error.message = `Timeout of ${options.timeout} ms with: ` + error.message
            }
            throw error
        })
    })
}
