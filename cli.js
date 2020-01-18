// Copyright © 2020 Hoani Bryson
// License: MIT (https://mit-license.org/)
//
// CLI
//
// User facing command line interface
//
const fs = require('fs');
const cli_parse = require("./src/cliParse");
const verify = require("./src/verify");
const leap = require("./index");
const directory = require('path').dirname(__filename)

// Generate the specified filetype
function handle_generate(filename) {
  let data = null;
  if (/.json$/.exec(filename) !== null) {
    data = fs.readFileSync(
      directory + '/src/config/generate.json'
    );
  }
  else if (/.toml$/.exec(filename) !== null) {
    data = fs.readFileSync(
      directory + '/src/config/generate.toml'
    );
  }
  else if (/.yaml$/.exec(filename) !== null) {
    data = fs.readFileSync(
      directory + '/src/config/generate.yaml'
    );
  }

  if (data == null) {
    console.log(
      `Failed to write config file to ${filename}. `+
      `Please specify a yaml, json or toml filename.`
    )
  }
  else {
    console.log(`Wrote config file to ${filename}`);
    fs.writeFileSync(filename, data);
  }
}


// Verify the specified file
function handle_verify(filename) {
  verify.verify(filename);
}


const settings = cli_parse.cli_parse();

if ("generate" in settings) {
  handle_generate(settings.generate);
}

if ("verify" in settings) {
  handle_verify(settings.verify);
}

