#!/usr/bin/env node
import { checkEnvironmentVariables } from '../utils';

checkEnvironmentVariables();

const path = require('path');
const createTorrent = require('create-torrent');
const parseTorrent = require('parse-torrent');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));

const {
  addTorrent: addTorrentToDatabase
} = require('../databaseOperations.js');

// TODO: Check for env variables and fail if not present with instructions

const {
  CAN_TRACKER_ANNOUNCE_URL,
} = process.env;


const processDir = process.cwd();


function writeTorrentFile(fileName, torrentBuffer) {
  fs.writeFile(path.join(processDir, fileName), torrentBuffer, (err) => {
    if (err) {
      console.error(err);
      throw err;
    }
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
  addTorrentToDatabase(parsedTorrent).then(() =>{
    writeTorrentFile(`can_tracker_${parsedTorrent.info.name}.torrent`, torrentBuffer);
  });
});