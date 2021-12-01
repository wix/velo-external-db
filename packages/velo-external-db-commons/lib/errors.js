class BaseHttpError extends Error {
    constructor(message, status) {
        super(message)
        this.status = status
    }
}

class UnauthorizedError extends BaseHttpError {
    constructor(message) {
        super(message, 401)
    }
}

class CollectionDoesNotExists extends BaseHttpError {
    constructor(message) {
        super(message, 404)
    }
}

class CollectionAlreadyExists extends BaseHttpError {
    constructor(message) {
        super(message, 400)
    }
}

class FieldAlreadyExists extends BaseHttpError {
    constructor(message) {
        super(message, 400)
    }
}

class FieldDoesNotExist extends BaseHttpError {
    constructor(message) {
        super(message, 404)
    }
}

class CannotModifySystemField extends BaseHttpError {
    constructor(message) {
        super(message, 400)
    }
}

class InvalidQuery extends BaseHttpError {
    constructor(message) {
        super(message, 400)
    }
}

class InvalidRequest extends BaseHttpError {
    constructor(message) {
        super(message, 400)
    }
}

class DbConnectionError extends BaseHttpError {
    constructor(message) {
        super(message, 500)
    }
}
class ItemNotFound extends BaseHttpError {
    constructor(message) {
        super(message, 404)
    }
}

module.exports = { UnauthorizedError, CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist, CannotModifySystemField, InvalidQuery,
                   CollectionAlreadyExists, DbConnectionError, InvalidRequest, ItemNotFound }