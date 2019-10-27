const sqlite = require('sqlite3').verbose();
const path = require('path');

import { checkEnvironmentVariables } from './utils';

checkEnvironmentVariables();

const {
  CAN_TRACKER_PATH: DB_PATH
} = process.env;

function getDatabase() {
  return new sqlite.Database(path.join(DB_PATH, 'trackedTorrents.db'));
}


export async function addTorrent(parsedTorrent) {
  const { infoHash } = parsedTorrent;
  const isTracked = await checkTorrentIsTracked(infoHash);

  if (isTracked) {
    console.warn(`Torrent with infoHash ${infoHash} is already tracked!`);
    return Promise.resolve();
  }

  return new Promise(async (resolve, reject) => {
    const db = getDatabase();
    db.run('INSERT INTO tracked_torrents(info_hash) VALUES (?)', [infoHash], (err) => {
      db.close();
      if (err !== null) {
        console.error(`Couldn't add torrent with info_hash: ${infoHash} to tracking database!`);
        console.error(err);
        return reject(err);
      }
      resolve();
    })
  })

}


export function checkTorrentIsTracked(infoHash) {
  const db = getDatabase();

  return new Promise((resolve, reject) => {
    db.get(`SELECT 1 FROM tracked_torrents WHERE info_hash = $infoHash`, {
      $infoHash: infoHash,
    }, (err, row) => {
      db.close();

      if (err !== null) {
        console.error('Something happened while running DB query!');
        console.error(err);
        reject(err);
        return;
      }

      if (row === undefined) {
        // We're not tracking this torrent
        resolve(false);
      }
      resolve(true);
    });
  })
}

export function createAndInitDatabase() {
  const db = getDatabase();

  return new Promise((resolve, reject) => {
    db.run(`CREATE TABLE IF NOT EXISTS tracked_torrents (
      info_hash TEXT PRIMARY KEY
    )`, [], (err) => {
      if (err !== null) {
        console.error('Something happened during DB creation!');
        console.error(err);
        reject(err);
        return;
      }
      db.close();
      resolve(1);
    });
  })
}
