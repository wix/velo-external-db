const { UnauthorizedError } = require('../error/errors')

const errorMiddleware = (err, req, res, next) => {
  switch (err.constructor.name) {
    case UnauthorizedError.name:
      res.status(401).send({ message: err.message })
      break
    default:
      res.status(500).send({ message: err.message })
      break
  }
}

module.exports = { errorMiddleware }