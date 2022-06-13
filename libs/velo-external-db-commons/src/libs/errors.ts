class BaseHttpError extends Error {
    status: number
    constructor(message: string, status: number) {
        super(message)
        this.status = status
    }
}

class UnauthorizedError extends BaseHttpError {
    constructor(message: string) {
        super(message, 401)
    }
}

class CollectionDoesNotExists extends BaseHttpError {
    constructor(message: string) {
        super(message, 404)
    }
}

class CollectionAlreadyExists extends BaseHttpError {
    constructor(message: string) {
        super(message, 400)
    }
}

class FieldAlreadyExists extends BaseHttpError {
    constructor(message: string) {
        super(message, 400)
    }
}

class ItemAlreadyExists extends BaseHttpError {
    constructor(message: string) {
        super(message, 400)
    }
}

class FieldDoesNotExist extends BaseHttpError {
    constructor(message: string) {
        super(message, 404)
    }
}

class CannotModifySystemField extends BaseHttpError {
    constructor(message: string) {
        super(message, 400)
    }
}

class InvalidQuery extends BaseHttpError {
    constructor(message: string) {
        super(message, 400)
    }
}

class InvalidRequest extends BaseHttpError {
    constructor(message: string) {
        super(message, 400)
    }
}

class DbConnectionError extends BaseHttpError {
    constructor(message: string) {
        super(message, 500)
    }
}
class ItemNotFound extends BaseHttpError {
    constructor(message: string) {
        super(message, 404)
    }
}

class UnsupportedOperation extends BaseHttpError {
    constructor(message: string) {
        super(message, 405)
    }
}

class UnsupportedDatabase extends BaseHttpError {
    constructor(message: string) {
        super(message, 405)
    }
}

export {
    UnauthorizedError, CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist, CannotModifySystemField, InvalidQuery,
    CollectionAlreadyExists, DbConnectionError, InvalidRequest, ItemNotFound, UnsupportedOperation, UnsupportedDatabase, ItemAlreadyExists
}