class BaseHttpError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status
    }
}

class UnauthorizedError extends BaseHttpError {
    constructor(message) {
        super(message, 401);
    }
}

class CollectionDoesNotExists extends BaseHttpError {
    constructor(message) {
        super(message, 404);
    }
}

class CollectionAlreadyExists extends BaseHttpError {
    constructor(message) {
        super(message, 400);
    }
}

class FieldAlreadyExists extends BaseHttpError {
    constructor(message) {
        super(message, 400);
    }
}

class FieldDoesNotExist extends BaseHttpError {
    constructor(message) {
        super(message, 404);
    }
}

class CannotModifySystemField extends BaseHttpError {
    constructor(message) {
        super(message, 400);
    }
}

class InvalidQuery extends BaseHttpError {
    constructor(message) {
        super(message, 400);
    }
}

class AccessDeniedError extends BaseHttpError {
    constructor(message) {
        super(message, 401);
    }
}
class WrongDatabaseError extends BaseHttpError {
    constructor(message) {
        super(message, 404);
    }
}
class HostDoesNotExists extends BaseHttpError {
    constructor(message) {
        super(message, 404);
    }
}

module.exports = { UnauthorizedError, CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist, CannotModifySystemField, InvalidQuery,
                   AccessDeniedError, WrongDatabaseError, HostDoesNotExists, CollectionAlreadyExists }