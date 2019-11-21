#!/usr/bin/env node
import { DEBUG, ERROR, INFO, checkEnvironmentVariables } from "../utils";
import { spawn } from "child_process";
import { statSync, readFileSync } from "fs";

checkEnvironmentVariables();

const path = require("path");
const createTorrent = require("can-mktorrent");
const parseTorrent = require("parse-torrent");
const argv = require("minimist")(process.argv.slice(2));

const {
  addTorrent: addTorrentToDatabase
} = require("../databaseOperations.js");

// TODO: Check for env variables and fail if not present with instructions

const {
  CAN_TRACKER_ANNOUNCE_URL,
  CAN_TRACKER_WEB_SEED_URL,
  CAN_TRACKER_POST_CREATE_SCRIPT_PATH
} = process.env;

if (!CAN_TRACKER_ANNOUNCE_URL || !CAN_TRACKER_WEB_SEED_URL) {
  ERROR("Please set the require environment variables");
  process.exit(1);
}

const processDir = process.cwd();

const sanitizedAnnounceUURL = CAN_TRACKER_ANNOUNCE_URL.endsWith("/")
  ? CAN_TRACKER_ANNOUNCE_URL.slice(0, CAN_TRACKER_ANNOUNCE_URL.length - 1)
  : CAN_TRACKER_ANNOUNCE_URL;

INFO("Creating torrent...");
DEBUG(argv._);
const torrentFileName = `can_tracker_${path.basename(argv._[0])}.torrent`;
createTorrent({
  private: true,
  announceUrls: [sanitizedAnnounceUURL],
  webSeedUrls: [CAN_TRACKER_WEB_SEED_URL],
  comment: "Created by can-tracker",
  output: torrentFileName,
  sourcePath: argv._[0]
}).then(() => {
  const filePath = path.join(process.cwd(), torrentFileName);
  DEBUG("torrent path:", filePath);
  const parsedTorrent = parseTorrent(readFileSync(filePath));

  addTorrentToDatabase(parsedTorrent).then(() => {
    if (!CAN_TRACKER_POST_CREATE_SCRIPT_PATH) return;

    try {
      statSync(CAN_TRACKER_POST_CREATE_SCRIPT_PATH);
    } catch (e) {
      ERROR("Post create script doesn't exist!");
      process.exit(1);
    }

    INFO("Found post installation script in env");

    let executor = null;

    if (CAN_TRACKER_POST_CREATE_SCRIPT_PATH.endsWith(".js")) {
      executor = "node";
    } else if (CAN_TRACKER_POST_CREATE_SCRIPT_PATH.endsWith(".sh")) {
      executor = "bash";
    } else if (CAN_TRACKER_POST_CREATE_SCRIPT_PATH.endsWith(".zsh")) {
      executor = "zsh";
    } else {
      ERROR("Only .js, .sh or .zsh scripts are supported.");
      return;
    }

    const cp = spawn(executor, [
      CAN_TRACKER_POST_CREATE_SCRIPT_PATH,
      filePath,
      argv._[0],
      ...argv._
    ]);

    cp.stdout.on("data", data => {
      INFO(">\t post create script:", data.toString());
    });

    cp.stderr.on("data", data => {
      ERROR(">\t post create script:", data.toString());
    });

    cp.on("close", code => {
      INFO(">\t post create script exited with code:", code);
    });
  });
});
