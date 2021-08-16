class ExternalDbConfigError extends Error {
    constructor(message, status) {
        super(message)
        this.status = status
    }
}

class MissingRequiredProps extends ExternalDbConfigError {
    constructor(message, missingProps) {
        super(message + missingProps, 400)
        this.missingProps = missingProps
    }
}

module.exports = { ExternalDbConfigError, MissingRequiredProps }