const Uninitialized = null

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = { sleep, Uninitialized }