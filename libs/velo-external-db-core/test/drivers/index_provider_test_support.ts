import { DomainIndex } from '@wix-velo/velo-external-db-types'
import { when } from 'jest-when'

export const indexProvider = {
    list: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
}

export const givenListResult = (indexes: DomainIndex[], collectionName: string) => {
    when(indexProvider.list).calledWith(collectionName).mockResolvedValue(indexes)
}

export const givenCreateResult = (index: DomainIndex, collectionName: string) => {
    const { status, ...indexWithoutStatus } = index
    when(indexProvider.create).calledWith(collectionName, indexWithoutStatus).mockResolvedValue(index)
}

export const reset = () => {
    indexProvider.list.mockReset()
    indexProvider.create.mockReset()
    indexProvider.remove.mockReset()
}


export function givenRemoveResult(collectionName: string, name: string) {
    when(indexProvider.remove).calledWith(collectionName, name).mockResolvedValue({})
}
