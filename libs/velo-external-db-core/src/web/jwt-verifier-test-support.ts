import { when } from 'jest-when'
import { errors } from '@wix-velo/velo-external-db-commons'

const { UnauthorizedError } = errors
export const jwtVerifier = {
    verifyAndDecode: jest.fn(),
}

export const givenValidToken = (token: string, decodedToken: any) => {
    when(jwtVerifier.verifyAndDecode).calledWith(token).mockReturnValue(decodedToken)
}

export const givenInvalidToken = (token: string, errorMsgFromVerifier: string) => {
    when(jwtVerifier.verifyAndDecode).calledWith(token).mockImplementation(() => { throw new UnauthorizedError(errorMsgFromVerifier) })
}

export const reset = () => {
    jwtVerifier.verifyAndDecode.mockClear()
}
