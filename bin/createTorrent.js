#!/usr/bin/env node
import { checkEnvironmentVariables } from '../utils';

const path = require('path');
const createTorrent = require('create-torrent');
const parseTorrent = require('parse-torrent');
const fs = require('fs').promises;
const fsStatSync = require('fs').statSync;
const argv = require('minimist')(process.argv.slice(2));

const {
  addTorrent: addTorrentToDatabase
} = require('../databaseOperations.js');

checkEnvironmentVariables();

const {
  CAN_TRACKER_ANNOUNCE_URL,
  CAN_TRACKER_WEB_SEED_URL
} = process.env;

if (!CAN_TRACKER_ANNOUNCE_URL || !CAN_TRACKER_WEB_SEED_URL) {
  console.error('Please set the require environment variables');
  process.exit(1);
}


const processDir = process.cwd();


async function writeTorrentFile(fileName, torrentBuffer) {
  const filePath = path.join(processDir, fileName);
  const fileHandle = await fs.open(filePath, 'w');
  return fileHandle.writeFile(torrentBuffer)
      .catch((err) => {
        console.error(err);
        throw err;
      })
      .then(() => {
        console.info(`Successfully created .torrent file with name: ${fileName}`);
      });
}

let webSeedUrl = CAN_TRACKER_WEB_SEED_URL;

if (argv._.length === 1) {
    const [ fileName ] = argv._;
    const stat = fsStatSync(fileName);
    if (stat.isFile()) {
        const split = fileName.split(path.sep);
        const name = split[split.length - 1];
        webSeedUrl = path.join(CAN_TRACKER_WEB_SEED_URL, name);
    }
}

console.log(argv._);
console.info("Creating torrent...");
createTorrent(argv._, {
  private: true,
  announceList: [
      [CAN_TRACKER_ANNOUNCE_URL],
  ],
  urlList: [webSeedUrl],
}, (err, torrentBuffer) => {
  if (err) throw err;

  const parsedTorrent = parseTorrent(torrentBuffer);
  return Promise.all([
      addTorrentToDatabase(parsedTorrent),
      writeTorrentFile(`can_tracker_${parsedTorrent.info.name}.torrent`, torrentBuffer)
  ]).then(() => {

  })
});