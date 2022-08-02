

const changeUrl = async(doc, url) => {
    doc.axios.defaults.baseURL = url
    doc.resetLocalCache()
    await doc.loadInfo()
}

const numToColumnLetter = (num) => {
    let s = '', t
  
    while (num > 0) {
      t = (num - 1) % 26
      s = String.fromCharCode(65 + t) + s
      num = (num - t)/26 | 0
    }
    return s || undefined
}


module.exports = { changeUrl, numToColumnLetter }
