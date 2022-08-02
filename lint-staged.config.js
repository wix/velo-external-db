module.exports = {
    '{apps, packages}/*.{ts,js}': [
        'nx affected --target lint --uncommitted --fix --quiet true',
    ],
}