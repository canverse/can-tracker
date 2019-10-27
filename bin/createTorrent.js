#!/usr/bin/env node
import { checkEnvironmentVariables } from '../utils';

checkEnvironmentVariables();

const path = require('path');
const createTorrent = require('create-torrent');
const parseTorrent = require('parse-torrent');
const fs = require('fs').promises;
const argv = require('minimist')(process.argv.slice(2));

const {
  addTorrent: addTorrentToDatabase
} = require('../databaseOperations.js');

// TODO: Check for env variables and fail if not present with instructions

const {
  CAN_TRACKER_ANNOUNCE_URL,
} = process.env;


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


console.info("Creating torrent...");
createTorrent(argv._, {
  private: true,
  announceList: [
      [CAN_TRACKER_ANNOUNCE_URL],
  ]
}, (err, torrentBuffer) => {
  if (err) throw err;

  const parsedTorrent = parseTorrent(torrentBuffer);
  return Promise.all([
      addTorrentToDatabase(parsedTorrent),
      writeTorrentFile(`can_tracker_${parsedTorrent.info.name}.torrent`, torrentBuffer)
  ]).then(() => {

  })
});