import { ExternalDbRouter } from '@wix-velo/velo-external-db-core'


export const splitIdToThreeParts = (id: string) => {
    return [id.slice(0, id.length / 3), id.slice(id.length / 3, id.length / 3 * 2), id.slice(id.length / 3 * 2)]
}

export const concatToProperty = <T>(obj: T, path: string, value: any): T => {
    const pathArray = path.split('.')
    const newObject = { ...obj }
    let current = newObject
  
    for (let i = 0; i < pathArray.length - 1; i++) {
      current = current[pathArray[i]]
    }
  
    current[pathArray[pathArray.length - 1]] += value
    return newObject
  }

export const resetHooks = (externalDbRouter: ExternalDbRouter) => externalDbRouter.reloadHooks()
