const errorMiddleware = (err, req, res, next) => {
  res.status(err.status || 500)
     .send({ message: err.message })
}

module.exports = { errorMiddleware }