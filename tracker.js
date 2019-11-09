import { Server } from 'bittorrent-tracker';
import { checkTorrentIsTracked} from "./databaseOperations";

const {
  CAN_TRACKER_PORT: PORT
} = process.env;


function filterTorrents(infoHash, params, cb) {
  return checkTorrentIsTracked(infoHash).then(isTracked => {
    if (isTracked) {
      cb(null);
    } else {
      cb(new Error('Untracked torrent file'));
    }
  }).catch(err => {
    cb(new Error(err));
  });
}


export function startServer() {
  const server = new Server({
    filter: filterTorrents,
    trustProxy: false,
  });

  server.on('error', err => {
    console.error(err);
  });

  server.on('listening', () => {
    console.info('listening on http port:', server.http.address().port);
    console.info('listening on udp port:', server.udp.address().port);
  });

  server.listen(PORT);
};
