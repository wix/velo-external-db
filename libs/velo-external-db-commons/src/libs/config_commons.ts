const objectContainsKey = (obj: { [x: string]: string | any[] }, key: string ) => typeof obj[key] === 'string' && obj[key].length > 0

const checkRequiredKeys = (obj: { [x: string]: string | any[] }, requiredKeys: any[]) => requiredKeys.filter((key: any) => !objectContainsKey(obj, key))

const checkThatHasAtLestOneRequiredKeys = (obj: { [x: string]: string | any[] }, keys: any[]) => keys.some((key: any) => objectContainsKey(obj, key)) ? [] : [keys.join('/')]

export { checkRequiredKeys, checkThatHasAtLestOneRequiredKeys }