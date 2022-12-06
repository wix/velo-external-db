export class ErrorMessage {
    static unknownError(description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0054,
            description
        } as ErrorMessage, HttpStatusCode.INTERNAL)
    }

    static operationTimeLimitExceeded(description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0028,
            description
        } as ErrorMessage, HttpStatusCode.RESOURCE_EXHAUSTED)
    }

    static invalidUpdate(description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0007,
            description
        } as ErrorMessage, HttpStatusCode.INVALID_ARGUMENT)
    }

    static operationIsNotSupportedByCollection(collectionName: string, operation: string, description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0119,
            description,
            data: {
                collectionName,
                operation
            } as UnsupportedByCollectionDetails
        } as ErrorMessage, HttpStatusCode.FAILED_PRECONDITION)
    }

    static operationIsNotSupportedByDataSource(collectionName: string, operation: string, description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0120,
            description,
            data: {
                collectionName,
                operation
            } as UnsupportedByCollectionDetails
        } as ErrorMessage, HttpStatusCode.FAILED_PRECONDITION)
    }

    static itemAlreadyExists(itemId: string, collectionName: string, description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0074,
            description,
            data: {
                itemId,
                collectionName
            } as InvalidItemDetails
        } as ErrorMessage, HttpStatusCode.ALREADY_EXISTS)
    }

    static uniqIndexConflict(itemId: string, collectionName: string, description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0123,
            description,
            data: {
                itemId,
                collectionName
            } as InvalidItemDetails
        } as ErrorMessage, HttpStatusCode.ALREADY_EXISTS)
    }

    static documentTooLargeToIndex(itemId: string, collectionName: string, description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0133,
            description,
            data: {
                itemId,
                collectionName
            } as InvalidItemDetails
        } as ErrorMessage, HttpStatusCode.INVALID_ARGUMENT)
    }

    static dollarPrefixedFieldNameNotAllowed(itemId: string, collectionName: string, description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0134,
            description,
            data: {
                itemId,
                collectionName
            } as InvalidItemDetails
        } as ErrorMessage, HttpStatusCode.INVALID_ARGUMENT)
    }

    static requestPerMinuteQuotaExceeded(description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0014,
            description
        } as ErrorMessage, HttpStatusCode.RESOURCE_EXHAUSTED)
    }

    static processingTimeQuotaExceeded(description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0122,
            description
        } as ErrorMessage, HttpStatusCode.RESOURCE_EXHAUSTED)
    }

    static storageSpaceQuotaExceeded(description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0091,
            description
        } as ErrorMessage, HttpStatusCode.RESOURCE_EXHAUSTED)
    }

    static documentIsTooLarge(itemId: string, collectionName: string, description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0009,
            description,
            data: {
                itemId,
                collectionName
            } as InvalidItemDetails
        } as ErrorMessage, HttpStatusCode.INVALID_ARGUMENT)
    }

    static itemNotFound(itemId: string, collectionName: string, description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0073,
            description,
            data: {
                itemId,
                collectionName
            } as InvalidItemDetails
        } as ErrorMessage, HttpStatusCode.NOT_FOUND)
    }

    static collectionNotFound(collectionName: string, description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0025,
            description,
            data: {
                collectionName
            } as InvalidCollectionDetails
        } as ErrorMessage, HttpStatusCode.NOT_FOUND)
    }

    static collectionDeleted(collectionName: string, description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0026,
            description,
            data: {
                collectionName
            } as InvalidCollectionDetails
        } as ErrorMessage, HttpStatusCode.NOT_FOUND)
    }

    static propertyDeleted(collectionName: string, propertyName: string, description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0024,
            description,
            data: {
                collectionName,
                propertyName
            } as InvalidPropertyDetails
        } as ErrorMessage, HttpStatusCode.INVALID_ARGUMENT)
    }

    static userDoesNotHavePermissionToPerformAction(collectionName: string, operation: string, description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0027,
            description,
            data: {
                collectionName,
                operation
            } as PermissionDeniedDetails
        } as ErrorMessage, HttpStatusCode.PERMISSION_DENIED)
    }

    static genericRequestValidationError(description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0075,
            description
        } as ErrorMessage, HttpStatusCode.INVALID_ARGUMENT)
    }

    static notAMultiReferenceProperty(collectionName: string, propertyName: string, description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0020,
            description,
            data: {
                collectionName,
                propertyName
            } as InvalidPropertyDetails
        } as ErrorMessage, HttpStatusCode.INVALID_ARGUMENT)
    } 

    static datasetIsTooLargeToSort(description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0092,
            description
        } as ErrorMessage, HttpStatusCode.INVALID_ARGUMENT)
    }

    static payloadIsToolarge(description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0109,
            description
        } as ErrorMessage, HttpStatusCode.INVALID_ARGUMENT)
    }

    static sortingByMultipleArrayFieldsIsNotSupported(description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0121,
            description
        } as ErrorMessage, HttpStatusCode.INVALID_ARGUMENT)
    }

    static offsetPagingIsNotSupported(description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0082,
            description
        } as ErrorMessage, HttpStatusCode.INVALID_ARGUMENT)
    }

    static referenceAlreadyExists(collectionName: string, propertyName: string, referencingItemId: string, referencedItemId: string, description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0029,
            description,
            data: {
                collectionName,
                propertyName,
                referencingItemId,
                referencedItemId
            } as InvalidReferenceDetails
        } as ErrorMessage, HttpStatusCode.ALREADY_EXISTS)
    }

    static unknownErrorWhileBuildingCollectionIndex(collectionName: string, itemId?: string, details?: string, description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0112,
            description,
            data: {
                collectionName,
                itemId,
                details,
            } as IndexingFailureDetails
        } as ErrorMessage, HttpStatusCode.ALREADY_EXISTS)
    }

    static duplicateKeyErrorWhileBuildingCollectionIndex(collectionName: string, itemId?: string, details?: string, description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0113,
            description,
            data: {
                collectionName,
                itemId,
                details,
            } as IndexingFailureDetails
        } as ErrorMessage, HttpStatusCode.ALREADY_EXISTS)
    }

    static documentTooLargeWhileBuildingCollectionIndex(collectionName: string, itemId?: string, details?: string, description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0114,
            description,
            data: {
                collectionName,
                itemId,
                details,
            } as IndexingFailureDetails
        } as ErrorMessage, HttpStatusCode.ALREADY_EXISTS)
    }

    static collectionAlreadyExists(collectionName: string, description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0104,
            description,
            data: {
                collectionName
            } as InvalidCollectionDetails
        } as ErrorMessage, HttpStatusCode.ALREADY_EXISTS)
    }

    static invalidProperty(collectionName: string, propertyName?: string, description?: string) {
        return HttpError.create({
            code: ApiErrors.WDE0147,
            description,
            data: {
                collectionName,
                propertyName
            } as InvalidPropertyDetails
        } as ErrorMessage, HttpStatusCode.INVALID_ARGUMENT)
    }
}

export interface HttpError {
    message: ErrorMessage,
    httpCode: HttpStatusCode
}

export class HttpError {
    static create(message: ErrorMessage, httpCode: HttpStatusCode) {
        return {
            message,
            httpCode
        } as HttpError
    }
}

export interface ErrorMessage {
    code: ApiErrors,
    description?: string,
    data: object
}




enum ApiErrors {
    // Unknown error
    WDE0054='WDE0054',
    // Operation time limit exceeded.
    WDE0028='WDE0028',
    // Invalid update. Updated object must have a string _id property.
    WDE0007='WDE0007',
    // Operation is not supported by collection
    WDE0119='WDE0119',
    // Operation is not supported by data source
    WDE0120='WDE0120',
    // Item already exists
    WDE0074='WDE0074',
    // Unique index conflict
    WDE0123='WDE0123',
    // Document too large to index
    WDE0133='WDE0133',
    // Dollar-prefixed field name not allowed
    WDE0134='WDE0134',
    // Requests per minute quota exceeded
    WDE0014='WDE0014',
    // Processing time quota exceeded
    WDE0122='WDE0122',
    // Storage space quota exceeded
    WDE0091='WDE0091',
    // Document is too large
    WDE0009='WDE0009',
    // Item not found
    WDE0073='WDE0073',
    // Collection not found
    WDE0025='WDE0025',
    // Collection deleted
    WDE0026='WDE0026',
    // Property deleted
    WDE0024='WDE0024',
    // User doesn't have permissions to perform action
    WDE0027='WDE0027',
    // Generic request validation error
    WDE0075='WDE0075',
    // Not a multi-reference property
    WDE0020='WDE0020',
    // Dataset is too large to sort
    WDE0092='WDE0092',
    // Payload is too large
    WDE0109='WDE0109',
    // Sorting by multiple array fields is not supported
    WDE0121='WDE0121',
    // Offset paging is not supported
    WDE0082='WDE0082',
    // Reference already exists
    WDE0029='WDE0029',
    // Unknown error while building collection index
    WDE0112='WDE0112',
    // Duplicate key error while building collection index
    WDE0113='WDE0113',
    // Document too large while building collection index
    WDE0114='WDE0114',
    // Collection already exists
    WDE0104='WDE0104',
    // Invalid property
    WDE0147='WDE0147'
}

enum HttpStatusCode {
    OK = 200,

    //Default error codes (applicable to all endpoints)

    // 401 - Identity missing (missing, invalid or expired oAuth token,
    // signed instance or cookies)
    UNAUTHENTICATED = 401,

    // 403 - Identity does not have the permission needed for this method / resource
    PERMISSION_DENIED = 403,

    // 400 - Bad Request. The client sent malformed body
    // or one of the arguments was invalid
    INVALID_ARGUMENT = 400,

    // 404 - Resource does not exist
    NOT_FOUND = 404,

    // 500 - Internal Server Error
    INTERNAL = 500,

    // 503 - Come back later, server is currently unavailable
    UNAVAILABLE = 503,

    // 429 - The client has sent too many requests
    // in a given amount of time (rate limit)
    RESOURCE_EXHAUSTED = 429,

    //Custom error codes - need to be documented

    // 499 - Request cancelled by the client
    CANCELED = 499,

    // 409 - Can't recreate same resource or concurrency conflict
    ALREADY_EXISTS = 409,

    // 428 - request cannot be executed in current system state
    // such as deleting a non-empty folder or paying with no funds
    FAILED_PRECONDITION = 428

    //DO NOT USE IN WIX
    // ABORTED = 11; // 409
    // OUT_OF_RANGE = 12; // 400
    // DEADLINE_EXEEDED = 13; // 504
    // DATA_LOSS = 14; // 500
    // UNIMPLEMENTED = 15; // 501
  }


interface UnsupportedByCollectionDetails {
    collectionName: string
    operation: string
}
interface InvalidItemDetails {
    itemId: string
    collectionName: string
}
interface InvalidCollectionDetails {
    collectionName: string
}
interface InvalidPropertyDetails {
    collectionName: string
    propertyName: string
}
interface PermissionDeniedDetails {
    collectionName: string
    operation: string
}
interface InvalidReferenceDetails {
    collectionName: string
    propertyName: string
    referencingItemId: string
    referencedItemId: string
}
interface IndexingFailureDetails {
    collectionName: string
    itemId?: string
    details?: string
}