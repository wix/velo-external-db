const EMPTY = ''

exports.parseSort = sort => {
  if (sort) {
    const parsed = sort.map(parseInternal).join(', ')
    return parsed ? `ORDER BY ${parsed}` : EMPTY
  }

  return EMPTY
}

const parseInternal = entry => {
  return `${entry.fieldName} ${entry.direction.toUpperCase()}`
}
