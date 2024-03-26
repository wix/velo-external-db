export class BaseHttpError extends Error {
    constructor(message: string) {
        super(message)
    }
}

export class UnauthorizedError extends BaseHttpError {
    constructor(message: string) {
        super(message)
    }
}

export class CollectionDoesNotExists extends BaseHttpError {
    collectionName: string
    constructor(message: string, collectionName?: string) {
        super(message)
        this.collectionName = collectionName ?? '' 
    }
}

export class CollectionAlreadyExists extends BaseHttpError {
    collectionName: string
    constructor(message: string, collectionName?: string) {
        super(message)
        this.collectionName = collectionName ?? '' 
    }
}

export class FieldAlreadyExists extends BaseHttpError {
    collectionName: string
    fieldName: string

    constructor(message: string, collectionName?: string, fieldName?: string) {
        super(message)
        this.collectionName = collectionName ?? '' 
        this.fieldName = fieldName ?? '' 
    }
}

export class ItemAlreadyExists extends BaseHttpError {
    itemId: string
    collectionName: string

    constructor(message: string, collectionName?: string, itemId?: string) {
        super(message)
        this.itemId = itemId ?? '' 
        this.collectionName = collectionName ?? '' 
    }
}

export class ItemDoesNotExists extends BaseHttpError {
    itemId: string
    collectionName: string

    constructor(message: string, collectionName?: string, itemId?: string) {
        super(message)
        this.itemId = itemId ?? '' 
        this.collectionName = collectionName ?? '' 
    }
}

export class FieldDoesNotExist extends BaseHttpError {
    propertyName: string
    collectionName: string
    constructor(message: string, collectionName?: string, propertyName?: string) {
        super(message)
        this.propertyName = propertyName ?? '' 
        this.collectionName = collectionName ?? '' 
    }
}

export class CannotModifySystemField extends BaseHttpError {
    constructor(message: string) {
        super(message)
    }
}

export class InvalidQuery extends BaseHttpError {
    constructor(message: string) {
        super(message)
    }
}

export class InvalidRequest extends BaseHttpError {
    constructor(message: string) {
        super(message)
    }
}

export class DbConnectionError extends BaseHttpError {
    constructor(message: string) {
        super(message)
    }
}
export class ItemNotFound extends BaseHttpError {
    constructor(message: string) {
        super(message)
    }
}

export class UnsupportedSchemaOperation extends BaseHttpError {
    collectionName: string
    operation: string

    constructor(message: string, collectionName?: string, operation?: string) {
        super(message)
        this.collectionName = collectionName ?? '' 
        this.operation = operation ?? '' 
    }
}

export class UnsupportedDatabase extends BaseHttpError {
    constructor(message: string) {
        super(message)
    }
}

export class UnrecognizedError extends BaseHttpError {
    constructor(message: string) {
        super(`Unrecognized Error: ${message}`)
    }
}

export class CollectionChangeNotSupportedError extends BaseHttpError {
    collectionName: string
    fieldName: string

    constructor(message: string, collectionName?: string, fieldName?: string) {
        super(message)
        this.collectionName = collectionName ?? '' 
        this.fieldName = fieldName ?? '' 
    }
}


export class IndexAlreadyExists extends BaseHttpError {
    constructor(message: string) {
        super(message)
    }
}

export class IndexDoesNotExist extends BaseHttpError {
    constructor(message: string) {
        super(message)
    }
}
