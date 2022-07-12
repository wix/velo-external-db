export interface IConfigReader {
    readConfig(): any
    readExternalAndLocalConfig?(): any
    readExternalConfig?(): any
}