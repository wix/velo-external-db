export type DynamoParsedFilter = {
    FilterExpression?: string,
    KeyConditionExpression?: string,
    ExpressionAttributeNames?: { [key: string]: string },
    ExpressionAttributeValues?: { [key: string]: any }
}