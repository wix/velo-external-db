
const lowercaseKeys = (obj) => {
    return Object.keys(obj).reduce((acc, key) => {
        acc[key.toLowerCase()] = obj[key];
        return acc;
    }, {});
}

const randomKey = (secrets) => {
    secretKeys = Object.keys(secrets);
    selectedKey = secretKeys[Math.floor(Math.random() * secretKeys.length)];
    return selectedKey;
}

const deleteRandomSecret = (secret) => {
    deletedKey = randomKey(secret);
    delete secret[deletedKey];
    return { deletedKey, newSecret: secret };
};

const clearRandomSecretKey = (secret) => {
    clearedKey = randomKey(secret);
    secret[clearedKey] = '';
    return { clearedKey, newSecret: secret };
}


module.exports = {
    lowercaseKeys,
    randomKey,
    deleteRandomSecret,
    clearRandomSecretKey
}