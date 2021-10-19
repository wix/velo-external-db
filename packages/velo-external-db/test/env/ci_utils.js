
const LocalDev = () => {
    const zz = process.env.CI
    console.log(typeof process.env.CI)
    console.log(typeof zz)
    console.log(process.env.CI)
    console.log(zz)
    console.log(zz === true)
    console.log(zz === 'true')

    return process.env.CI !== 'true'
}

module.exports = { LocalDev }