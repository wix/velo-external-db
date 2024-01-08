class BaseWixError extends Error {
    collctionName: string
    httpCode: HttpStatusCode
    applicationCode: ApiErrors

    constructor(message: string, httpCode: HttpStatusCode, applicationCode: ApiErrors, collectionName: string) {
        super(message)
        this.httpCode = httpCode
        this.applicationCode = applicationCode
        this.collctionName = collectionName
    }
}

export class CollectionNotFoundError extends BaseWixError {
    data: { collectionId: string }

    constructor(collectionName: string, message: string) {
        super(message, HttpStatusCode.NOT_FOUND, ApiErrors.WDE0025, collectionName)
        this.data = { collectionId: collectionName }
    }
}

export class CollectionAlreadyExistsError extends BaseWixError {
    data: { collectionId: string }

    constructor(collectionName: string, message: string) {
        super(message, HttpStatusCode.ALREADY_EXISTS, ApiErrors.WDE0104, collectionName)
        this.data = { collectionId: collectionName }
    }
}

export class ItemNotFoundError extends BaseWixError {
    data: { itemId: string }

    constructor(collectionName: string, itemId: string, message: string) {
        super(message, HttpStatusCode.NOT_FOUND, ApiErrors.WDE0073, collectionName)
        this.data = { itemId }
    }
}

export class ItemAlreadyExistsError extends BaseWixError {
    data: { itemId: string }

    constructor(collectionName: string, itemId: string, message: string) {
        super(message, HttpStatusCode.ALREADY_EXISTS, ApiErrors.WDE0074, collectionName)
        this.data = { itemId }
    }
}

export class ReferenceNotFoundError extends BaseWixError {
    referringItemId: string
    referencedItemId: string
    data: { referringItemId: string, referencedItemId: string }

    constructor(message: string, collectionName: string, referringItemId: string, referencedItemId: string) {
        super(message, HttpStatusCode.NOT_FOUND, ApiErrors.WDE0029, collectionName)
        this.referringItemId = referringItemId
        this.referencedItemId = referencedItemId
        this.data = { referringItemId, referencedItemId }
    }
}

export class ReferenceAlreadyExistsError extends BaseWixError {
    referringItemId: string
    referencedItemId: string
    data: { referringItemId: string, referencedItemId: string }

    constructor(message: string, collectionName: string, referringItemId: string, referencedItemId: string) {
        super(message, HttpStatusCode.ALREADY_EXISTS, ApiErrors.WDE0029, collectionName)
        this.referringItemId = referringItemId
        this.referencedItemId = referencedItemId
        this.data = { referringItemId, referencedItemId }
    }
}

export interface ValidationViolation {
    fieldPath: string;
    rejectedValue: string;
    message: string;
}

export class ValidationError extends BaseWixError {
    violations: ValidationViolation[]
    data: { violations: ValidationViolation[] }

    constructor(message: string, collectionName: string, fieldPath: string, rejectedValue: string) {
        super(message, HttpStatusCode.INVALID_ARGUMENT, ApiErrors.WDE0075, collectionName)
        this.violations = [{ fieldPath, rejectedValue, message }]
        this.data = { violations: this.violations }
    }
}

export interface CollectionChangeNotSupportedErrorItem {
    fieldKey: string;
    message: string;
}

export class CollectionChangeNotSupportedError extends BaseWixError {
    errors: CollectionChangeNotSupportedErrorItem[]
    data: { errors: CollectionChangeNotSupportedErrorItem[] }

    constructor(collectionName: string, fieldKey: string, message: string) {
        super(message, HttpStatusCode.INVALID_ARGUMENT, ApiErrors.WDE0119, collectionName)
        this.errors = [{ fieldKey, message }]
        this.data = { errors: this.errors }
    }
}

export class UnknownError extends BaseWixError {
    data: { description: string }
    constructor(message: string, httpCode: number =  HttpStatusCode.INTERNAL) {
        super(message, httpCode, ApiErrors.WDE0054, '')
        this.data = { description: message }
    }
}


export class InvalidPropertyError extends BaseWixError {
    data: { collectionId: string, propertyName: string }

    constructor(collectionName: string, propertyName: string, message: string) {
        super(message, HttpStatusCode.INVALID_ARGUMENT, ApiErrors.WDE0147, collectionName)
        this.data = { collectionId: collectionName, propertyName }
    }
}


export class UnauthorizedError extends BaseWixError {
    data: { description: string }
    constructor(message: string) {
        super(message, HttpStatusCode.UNAUTHENTICATED, ApiErrors.WDE0027, '')
        this.data = { description: message }
    }
}

export class FieldAlreadyExistsError extends BaseWixError {
    data: { collectionId: string, fieldName: string }

    constructor(collectionName: string, fieldName: string, message: string) {
        super(message, HttpStatusCode.ALREADY_EXISTS, ApiErrors.WDE0123, collectionName)
        this.data = { collectionId: collectionName, fieldName }
    }
}

export class UnsupportedSchemaOperation extends BaseWixError {
    data: { collectionId: string, operation: string }

    constructor(collectionName: string, operation: string, message: string) {
        super(message, HttpStatusCode.INVALID_ARGUMENT, ApiErrors.WDE0119, collectionName)
        this.data = { collectionId: collectionName, operation }
    }
}


export enum ApiErrors {
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

export enum HttpStatusCode {
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
