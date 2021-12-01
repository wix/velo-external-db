const passwdGen = require('generate-password')

const shuffle = array => array.sort(() => Math.random() - 0.5)


const randomPassword = () => {
    const passwds = passwdGen.generateMultiple(10, { length: 30, numbers: true/*, symbols: true*/ })
    return shuffle(passwds)[0]
}

const randomSecretKey = () => {
    const passwds = passwdGen.generateMultiple(10, { length: 30, numbers: true, symbols: true })
    return shuffle(passwds)[0]
}


const randomCredentials = () => ({ user: 'velo_user', passwd: randomPassword() })

module.exports = { randomCredentials, randomSecretKey }
