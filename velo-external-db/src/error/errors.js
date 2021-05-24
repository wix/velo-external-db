class UnauthorizedError extends Error {}
class CollectionDoesNotExists extends Error {}
class FieldAlreadyExists extends Error {}
class FieldDoesNotExist extends Error {}
class CannotModifySystemField extends Error {
    constructor(message) {
        super();
        this.message = message;
        this.code = 'SYSTEM_FIELD'
    }
}

module.exports = { UnauthorizedError, CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist, CannotModifySystemField }