

const yaml = require('js-yaml');
const toml = require('toml');
const fs = require('fs');
const configVerifier = require('./configVerifier');

exports.verify = function verify(filepath){
  return do_verify(filepath, true);
}

exports.verify_quiet = function verify_quiet(filepath){
  return do_verify(filepath, false);
}

function do_verify(filepath, print){
  const data = verify_open_file(filepath, print);

  if (data.length != 0) {
    const config = verify_load_config(data, print);

    if (typeof config === "object" && config.length != 0) {
      return verify_check_config(config, print, filepath);
    }
  }
  return false;
}

function verify_open_file(filepath, print) {
  let data;
  try {
    data = fs.readFileSync(filepath);
  }
  catch {
    data = "";
  }
  if (data.length == 0) {
    if (print) {
      console.log(`File ${filepath} cannot be opened, maybe it doesn't exist?`);
    }
  }
  return data;
}

function verify_load_config(data, print) {
  let config;
  try {
    config = JSON.parse(data);
  }
  catch {
    config = "";
    try {
      config = toml.parse(data);
    }
    catch {
      config = "";
      try {
        config = yaml.load(data);
      }
      catch {
        config = "";
        if (print) {
          console.log(`Verification of ${filepath} failed`);
          console.log("Invalid JSON/TOML/YAML");
        }
      }
    }
  }

  return config;
}

function verify_check_config(config, print, filepath) {
  const v = new configVerifier.ConfigVerifier();

  const result = v.verify(config);
  if (print) {
    if (result == true) {
      console.log(`Verification of ${filepath} passed`);
    }
    else {
      console.log(`Verification of ${filepath} failed`);
      console.log(config);
      v.print_failure();
      console.log(config);
    }
  }

  return result;
}


