import CommonConfigReader from '../../src/readers/common_config_reader'
import * as Chance from 'chance'
import { CommonConfig } from '../test_types'
const chance = new Chance()

export const defineValidConfig = (config: CommonConfig) => {
    if (config.vendor) {
        process.env['CLOUD_VENDOR'] = config.vendor
    }
    if (config.type) {
        process.env['TYPE'] = config.type
    }
}

export const validConfig = (): CommonConfig => ({
    vendor: chance.word(),
    type: chance.word()
})

export const ExpectedProperties = ['CLOUD_VENDOR', 'TYPE']

export const reset = () => ExpectedProperties.forEach(p => delete process.env[p])
export const hasReadErrors = false
export const configReaderProvider = new CommonConfigReader()
