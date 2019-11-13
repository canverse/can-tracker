#!/usr/bin/env node
const { wrapBinaryCommands } = require("./wrapBinaryCommands");

Promise.all([wrapBinaryCommands()]).then(() => {
  console.log("Done settin up");
});

