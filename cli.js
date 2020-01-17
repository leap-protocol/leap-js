// Copyright © 2020 Hoani Bryson
// License: MIT (https://mit-license.org/)
//
// CLI
//
// User facing command line interface
//

const argparse = require("argparse")
const leap = require("./index");

console.log(leap.verify("test.json"));

