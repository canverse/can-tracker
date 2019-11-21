import { Server } from "bittorrent-tracker";
import { checkTorrentIsTracked } from "./databaseOperations";
import { ERROR, INFO } from "./utils";

const { CAN_TRACKER_PORT: PORT } = process.env;

function filterTorrents(infoHash, params, cb) {
  return checkTorrentIsTracked(infoHash)
    .then(isTracked => {
      if (isTracked) {
        cb(null);
      } else {
        cb(new Error("Untracked torrent file"));
      }
    })
    .catch(err => {
      DEBUG("Error responding to announce!", err);
      cb(new Error("Server error"));
    });
}

export function startServer() {
  const server = new Server({
    filter: filterTorrents,
    trustProxy: false
  });

  server.on("error", err => {
    ERROR(err);
  });

  server.on("listening", () => {
    INFO("listening on http port:", server.http.address().port);
    INFO("listening on udp port:", server.udp.address().port);
  });

  server.listen(PORT);
}
