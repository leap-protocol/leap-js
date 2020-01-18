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
const codec = require("./src/codec");
const packet = require("./src/packet");
const leap = require("./index");
const directory = require('path').dirname(__filename)


// fetch a config file's data based on filename extension
function fetch_default_config(filename) {
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

  return data;
}

// Generate the specified filetype
function handle_generate(filename) {
  const data = fetch_default_config(filename);

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

// Verify encode a packet
function handle_encode(filename, category, address, payload) {
  const c = new codec.Codec(filename);
  if (c.valid() == false) {
    verify.verify(filename);
  }
  else {
    const p = new packet.Packet(category, address, payload);
    const encoded = c.encode(p);  
    console.log(``+
      `Encoded Packet ( ${category}, ${address}, [${payload.toString()}]):\n`+
      `${encoded}`
    );
  }
}

// Verify encode a packet
function handle_decode(filename, encoded) {
  const c = new codec.Codec(filename);
  const [_, [p]] = c.decode(encoded + c._config["end"]);
  const u = c.unpack(p);

  console.log(
    `Decoded Packet <${encoded}>:\n`+
    `   category - ${p.category}`
  );
  Object.keys(u).forEach(function(key) {
    console.log(
      `   address "${key}" = ${u[key]}`
    );
  });
}


const settings = cli_parse.cli_parse();

if ("generate" in settings) {
  handle_generate(settings.generate);
}

if ("verify" in settings) {
  if (settings.verify != null) {
    handle_verify(settings.verify);
  }
}

if ("encode" in settings) {
  if (settings.encode != null) {
    if (settings.payload == null) {
      settings.payload = [];
    }
    handle_encode(
      settings.encode, 
      settings.category, 
      settings.address, 
      settings.payload
    );
  }
}

if ("decode" in settings) {
  if (settings.decode != null) {
    handle_decode(
      settings.decode, 
      settings.packet
    );
  }
}

