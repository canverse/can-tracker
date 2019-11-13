const packageInfo = require('../package.json');
const fs = require('fs').promises;
const path = require('path');

const WRAPPER_CONTENT = fileName => `#!/usr/bin/env node
const path = require('path');
require = require('esm')(module);
console.log(module.path);
module.exports = require(path.join(module.path, '..', '${fileName}'));
`;


export async function wrapBinaryCommands() {
  await fs.mkdir(path.join('./bin/.build'), { recursive: true });

  const commands = packageInfo.bin;
  const promises = Object.keys(commands).map(async cmd => {
    const sourceName = commands[cmd].split('/')[3];
    const filePath = path.join('./bin/.build/', sourceName);
    const fileHandle = await fs.open(filePath, 'w');
    return fileHandle.writeFile(WRAPPER_CONTENT(sourceName)).then(() => {
      fileHandle.close();
    });
  });

  console.info('Creating wrapper bin files under ./bin/.build/');
  Promise.all(promises).then(() => {
    console.info('Successfully finished wrapping binary commands');
  });
}
