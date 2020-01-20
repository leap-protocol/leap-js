// Copyright © 2020 Hoani Bryson
// License: MIT (https://mit-license.org/)
//
// Verify
//
// Provides high level functions for verifying a L3aP config file
//


const configVerifier = require('./configVerifier.js');

exports.verify = function verify(input){
  return do_verify(input, true);
}

exports.verify_quiet = function verify_quiet(input){
  return do_verify(input, false);
}

function do_verify(input, print){
  const config = input;

  if (typeof config === "object" && config.length != 0) {
    return verify_check_config(config, print);
  }
  if (print) {
    console.log(
      `Configuration was not an object - was the correct type passed in?`
    );
  }
  return false;
}

function verify_check_config(config, print) {
  const v = new configVerifier.ConfigVerifier();

  const result = v.verify(config);
  if (print) {
    if (result == true) {
      console.log(`Verification of configuration passed`);
    }
    else {
      console.log(`Verification of configuration failed`);
      console.log(config);
      v.print_failure();
      console.log(config);
    }
  }

  return result;
}


