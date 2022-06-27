
export const requestBodyWith = (secretKey: string, role: string | undefined, path: string | undefined) => ({
    path: path || '/',
    body: {
        requestContext: {
            role: role || 'OWNER',
            settings: {
                secretKey: secretKey
            } } } } )
