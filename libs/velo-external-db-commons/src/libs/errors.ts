class BaseHttpError extends Error {
    status: number
    constructor(message: string, status: number) {
        super(message)
        this.status = status
    }
}

export class UnauthorizedError extends BaseHttpError {
    constructor(message: string) {
        super(message, 401)
    }
}

export class CollectionDoesNotExists extends BaseHttpError {
    constructor(message: string) {
        super(message, 404)
    }
}

export class CollectionAlreadyExists extends BaseHttpError {
    constructor(message: string) {
        super(message, 400)
    }
}

export class FieldAlreadyExists extends BaseHttpError {
    constructor(message: string) {
        super(message, 400)
    }
}

export class ItemAlreadyExists extends BaseHttpError {
    constructor(message: string) {
        super(message, 400)
    }
}

export class FieldDoesNotExist extends BaseHttpError {
    constructor(message: string) {
        super(message, 404)
    }
}

export class CannotModifySystemField extends BaseHttpError {
    constructor(message: string) {
        super(message, 400)
    }
}

export class InvalidQuery extends BaseHttpError {
    constructor(message: string) {
        super(message, 400)
    }
}

export class InvalidRequest extends BaseHttpError {
    constructor(message: string) {
        super(message, 400)
    }
}

export class DbConnectionError extends BaseHttpError {
    constructor(message: string) {
        super(message, 500)
    }
}
export class ItemNotFound extends BaseHttpError {
    constructor(message: string) {
        super(message, 404)
    }
}

export class UnsupportedOperation extends BaseHttpError {
    constructor(message: string) {
        super(message, 405)
    }
}

export class UnsupportedDatabase extends BaseHttpError {
    constructor(message: string) {
        super(message, 405)
    }
}
