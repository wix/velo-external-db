const BadRequestError = require('../model/error/bad-request')
const AlreadyExistsError = require('../model/error/already-exists')
const NotFoundError = require('../model/error/not-found')
const UnauthorizedError = require('../model/error/unauthorized')

/**
 * A helper that allows passing errors from async/await functions
 * to express 'next' for correct handling.
 * @param {*} fn the function to apply middleware to.
 */
exports.wrapError = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

exports.errorMiddleware = (err, req, res, next) => {
  switch (err.constructor.name) {
    case BadRequestError.name:
      res.status(400).send({ message: err.message })
      break
    case AlreadyExistsError.name:
      res.status(409).send({ message: err.message })
      break
    case UnauthorizedError.name:
      res.status(401).send({ message: err.message })
      break
    case NotFoundError.name:
      res.status(404).send({ message: err.message })
      break
    default:
      res.status(500).send({ message: err.message })
      break
  }
}
