export type DynamoParsedFilter = {
    FilterExpression?: string,
    KeyConditionExpression?: string,
    ExpressionAttributeNames?: { [key: string]: string },
    ExpressionAttributeValues?: { [key: string]: any }
    ProjectionExpression?: { [key: string]: string }
}

export interface DynamoConfig {
    region: string
    endpoint?: string
    [x: string]: any
}