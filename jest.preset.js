const nxPreset = require('@nrwl/jest/preset').default

module.exports = { 
  ...nxPreset,
  moduleNameMapper: {
    ...nxPreset.moduleNameMapper,
    '^@typespec/ts-http-runtime/internal/(.*)$': '<rootDir>/../../node_modules/@typespec/ts-http-runtime/dist/commonjs/$1/internal.js',
  }
}
