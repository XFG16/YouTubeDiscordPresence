const fs = require('fs');
const { version } = require('../package.json');

fs.writeFileSync('src/version.json', JSON.stringify({ version: version }));
