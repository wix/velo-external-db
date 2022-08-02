module.exports = {
    '*.{ts,js}': [
        'nx affected --target lint --uncommitted --fix --quiet true',
    ],
}