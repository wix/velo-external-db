import { IConfigReader } from '../types'

export default class StubConfigReader implements IConfigReader {
    constructor() {
    }

    readConfig() {
        return {}
    }
}
