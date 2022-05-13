
const requestBodyWith = (secretKey, role, path) => ({
    path: path || '/',
    body: {
        requestContext: {
            role: role || 'OWNER',
            settings: {
                secretKey: secretKey
            } } } } )

module.exports = { requestBodyWith }