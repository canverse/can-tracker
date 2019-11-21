import assertEnv from "assert-env";
import chalk from "chalk";
import { inspect } from "util";

export function checkEnvironmentVariables() {
  try {
    assertEnv([
      "CAN_TRACKER_ANNOUNCE_URL",
      "CAN_TRACKER_PATH",
      "CAN_TRACKER_PORT",
      "CAN_TRACKER_WEB_SEED_URL"
    ]);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

const { CAN_TRACKER_DEBUG } = process.env;

const errorColor = chalk.bold.red;
const infoColor = chalk.bold.black;
const debugColor = chalk.cyan;
const warningColor = chalk.yellow;

function log(color) {
  const sanitizedArgs = [...arguments]
    .slice(1)
    .map(x => (typeof x === "string" ? x : inspect(x)));
  console.log(chalk.magenta`can-tracker:`, color(...sanitizedArgs));
}

export function DEBUG() {
  CAN_TRACKER_DEBUG && log(debugColor, ...arguments);
}

export function INFO() {
  log(infoColor, ...arguments);
}

export function ERROR() {
  log(errorColor, ...arguments);
}

export function WARN() {
  log(warninwarningColor, ...arguments);
}

