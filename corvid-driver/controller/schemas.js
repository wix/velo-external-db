const Schema = require('../service/schema')

exports.findSchemas = async (req, res) => {
  const findResult = await Schema.find(req.body)

  res.json(findResult)
}

exports.listSchemas = async (req, res) => {
  const findResult = await Schema.list(req.body)

  res.json(findResult)
}
