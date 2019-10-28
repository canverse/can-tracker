import { checkEnvironmentVariables } from '../utils';
import { addTorrent } from '../databaseOperations';

checkEnvironmentVariables();


const parseTorrent = require('parse-torrent');
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs').promises;

const files = argv._.filter(x => x.endsWith('.torrent'));

Promise.all(files.map(async f => {
  const fileExists = await fs.stat(f);

  if (!fileExists) {
    return Promise.resolve({
      success: false,
      error: `Specified file doesn't exist! (${f})`,
    });
  }

  const fileHandle = await fs.open(f, 'r');
  const torrentBuffer = await fileHandle.readFile();
  const parsedTorrent = parseTorrent(torrentBuffer);
  return addTorrent(parsedTorrent);
}));

