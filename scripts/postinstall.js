#!/usr/bin/env node
const { wrapBinaryCommands } = require("./wrapBinaryCommands");
const { INFO } = require("./utils");

Promise.all([wrapBinaryCommands()]).then(() => {
  INFO("Finished post installation!");
});
