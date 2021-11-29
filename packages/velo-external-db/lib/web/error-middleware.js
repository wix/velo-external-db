const errorMiddleware = (err, req, res) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(err)
  }
  res.status(err.status || 500)
     .send({ message: err.message })
}

module.exports = { errorMiddleware }