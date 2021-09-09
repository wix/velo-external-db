
'use strict';

const { aws_adapter_installer } = require('./aws_adapter_installer')

const main = async () => {
    await aws_adapter_installer();
}

main();

module.exports = { main }


