const errorMiddleware = (err, req, res, next) => {
  res.status(err.status)
     .send({ message: err.message })
}

module.exports = { errorMiddleware }