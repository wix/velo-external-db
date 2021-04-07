const compose = require('docker-compose')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


const initSpannerEnv = async () => {

    process.env.SPANNER_EMULATOR_HOST = 'localhost:9010'

    await compose.upOne('spanner', { cwd: __dirname, log: true })
    await compose.logs('spanner', { cwd: __dirname, log: true });

    await sleep( 500 )
}

const shutSpannerEnv = async () => {
    await compose.stopOne('spanner', { cwd: __dirname, log: true })
}

module.exports = { initSpannerEnv, shutSpannerEnv }