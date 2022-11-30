
export function decodeBase64(data: string): string {
    const buff = Buffer.from(data, 'base64')
    return buff.toString('ascii')
}
export function encodeBase64(data: string): string {
    const buff = Buffer.from(data, 'utf-8')
    return buff.toString('base64')
}
