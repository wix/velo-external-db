const getHostAndDB = () => {
    const host = process.env.HOST || "Host not provided!"
    const database = process.env.DB || "Database not provided!"
    return { host, database }
}

const getConnectionStatusString = async (databaseOperations) => {
    try {
        await databaseOperations.checkIfConnectionSucceeded()
        return "Connected to database successfully"
    } catch (e) {
        return `Connection to database failed, ${e.message}`
    }
}

module.exports = { getHostAndDB, getConnectionStatusString }
