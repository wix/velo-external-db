exports.convert = table => {

  let allowedOperations = ["get", "find", "count", "update", "insert", "remove"];

  if (process.env.ALLOWED_OPERATIONS){
    allowedOperations = JSON.parse(process.env.ALLOWED_OPERATIONS); 
  }

  return {
    displayName: table.table,
    id: table.table,
    allowedOperations: allowedOperations,
    maxPageSize: 50,
    ttl: 3600,
    fields: convertFields(table.columns)
  }
}

const convertFields = columns => {
  return columns
    .map(field => {
      return {
        displayName: field.name,
        type: extractFieldType(field.type),
        queryOperators: [
          'eq',
          'lt',
          'gt',
          'hasSome',
          'and',
          'lte',
          'gte',
          'or',
          'not',
          'ne',
          'startsWith',
          'endsWith'
        ]
      }
    })
    .reduce((map, obj) => {
      map[obj.displayName] = obj
      return map
    }, {})
}

const extractFieldType = dbType => {
  const type = dbType
    .toLowerCase()
    .split('(')
    .shift()

  switch (type) {
    case 'varchar':
    case 'text':
      return 'text'
    case 'decimal':
    case 'bigint':
    case 'int':
      return 'number'
    case 'tinyint':
      return 'boolean'
    case 'date':
    case 'datetime':
    case 'time':
      return 'datetime'
    case 'json':
    default:
      return 'object'
  }
}
