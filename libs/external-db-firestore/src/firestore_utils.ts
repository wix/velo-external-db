import { Timestamp } from '@google-cloud/firestore'

export const LastLetterCoder = String.fromCharCode(65535)

export const fixDates = (value : any) => {
    if (value instanceof Timestamp) {
        return value.toDate()
    }
    return value
}


export const asEntity = (docEntity: any) => {
  const doc = docEntity.data()
  return Object.keys(doc)
  .reduce(function(obj: { [key: string]: any}, key: any) {
      return { ...obj, [key]: fixDates(doc[key]) }
  }.bind(this), {})
}




