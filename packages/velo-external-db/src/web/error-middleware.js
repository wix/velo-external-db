const errorMiddleware = (err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500)
     .send({ message: err.message })
}

module.exports = { errorMiddleware }