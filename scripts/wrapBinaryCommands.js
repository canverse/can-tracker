#!/usr/bin/env node
const packageInfo = require("../package.json");
const fs = require("fs").promises;
const path = require("path");
const { INFO } = require("utils");

const WRAPPER_CONTENT = fileName => `#!/usr/bin/env node
const path = require('path');
require = require('esm')(module);
module.exports = require(path.join(module.path, '..', '${fileName}'));
`;

export async function wrapBinaryCommands() {
  await fs.mkdir(path.join("./bin/.build"), { recursive: true });

  const commands = packageInfo.bin;
  const promises = Object.keys(commands).map(async cmd => {
    const sourceName = commands[cmd].split("/")[3];
    const filePath = path.join("./bin/.build/", sourceName);
    const fileHandle = await fs.open(filePath, "w");
    return fileHandle.writeFile(WRAPPER_CONTENT(sourceName)).then(() => {
      fileHandle.close();
    });
  });

  INFO("Creating wrapper bin files under ./bin/.build/");
  Promise.all(promises).then(() => {
    INFO("Successfully finished wrapping binary commands");
  });
}
