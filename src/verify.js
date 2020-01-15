

const toml = require('toml');
const fs = require('fs');
const protocolKey = require('./protocolKey.js');

exports.verify = function verify(filepath){
  return do_verify(filepath, true);
}

exports.verify_quiet = function verify_quiet(filepath){
  return do_verify(filepath, false);
}

function do_verify(filepath, print){
  const data = fs.readFileSync(filepath);
  if (data.length == 0) {
    if (print) {
      console.log(`File ${filepath} cannot be opened, maybe it doesn't exist?`);
    }
    return false;
  }

  let config;
  let invalid = false;
  try {
    config = JSON.parse(data);
  }
  catch {
    config = "";
  }
  if (config.length == 0) {
    try {
      config = toml.parse(data);
    }
    catch {
      config = "";
    }
    if (config.length == 0) {
      invalid = true;
    }
  }

  if (invalid) {
    if (print) {
      console.log(`Verification of ${filepath} failed`);
      console.log("Invalid JSON/TOML");
    }
    return false;
  }

  v = new exports.Verifier();

  result = v.verify(config);
  if (result == false) {
    if (print) {
      console.log(`Verification of ${filepath} failed`);
      v.print_failure();
      console.log(config);
    }
    return false;
  }
  else {
    if (print) {
      console.log(`Verification of ${filepath} passed`);
    }
    return true;
  }
}


exports.Verifier = class Verifier {
  constructor() {
    this._reset();
  }

  _reset() {
    this.section = "";
    this.failure = "";
    this.addr = [];
    this.current_addr = null;
    this.depth = -1;
  }

  verify(config) {
    this._reset();

    if (config.length == 0) {
      this.section = "Config";
      this.print_failure = "Configuration is empty";
      return false;
    }

    if (this.verify_category(config) == false) {
      this.section = "Category";
      return false;
    }

    if (this.verify_version(config) == false) {
      this.section = "Version";
      return false;
    }

    if (this.verify_symbols(config) == false) {
      this.section = "Symbols";
      return false;
    }

    if (this.verify_data(config, "root") == false) {
      this.section = "Data";
      return false;
    }

    return true;
  }

  update_addr(addr, depth) {
    let next_addr;
    if (addr == null) {
      if (this.current_addr == null) {
        next_addr = 0;
      }
      else {
        next_addr = this._to_addr_int(this.current_addr);
        next_addr += 1
      }
      if (this.depth < depth) {
        this.addr.push(0);
      }
    }
    else {
      if (this.depth >= depth) {
        this.addr[depth] = addr;
      }
      else {
        this.addr.push(addr);
      }
      next_addr = 0;
      for (let i = 0; i < depth + 1; i++) {
        next_addr += this._to_addr_int(this.addr[i]);
      }
    }
    this.depth = Math.max(this.depth, depth);

    if (this.current_addr == null) {
      this.current_addr = this._to_addr_string(next_addr);
      return true;
    }
    else if (next_addr <= this._to_addr_int(this.current_addr)) {
      this.failure = `Next address ${this._to_addr_string(next_addr)} is lower than previous address ${this.current_addr}`;
      return false;
    }
    else if (next_addr > 0xFFFF) {
      this.failure = `Next address 0x${this._to_addr_string(next_addr)} has overrun 0xFFFF`;
      return false;
    }
    else {
      this.current_addr = this._to_addr_string(next_addr);
      return true;
    }
  }


  print_failure() {
    if (this.section != "") {
      console.log("---");
      console.log("Config Verification Failed");
      console.log("");
      console.log(`Section: ${this.section}`);
      console.log(`Failure: ${this.failure}`);
      console.log("---");
    }
  }

  verify_data(config, branch) {
    if (("data" in config) == false) {
      this.failure = `Missing data key in ${branch} data structure`;
      return false;
    }

    const data = config["data"];
    if (typeof data !== "object") {
      this.failure = `data in ${branch} must be an array of items`;
      return false;
    }

    if (data.length == 0) {
      this.failure = `data in ${branch} is empty`;
      return false;
    }

    for (let i in data) {
      const item = data[i];

      if (this.verify_item(item, branch) == false) {
        return false;
      }
    }

    return true;
  }

  verify_item(item, branch) {
    if (typeof item !== "object") {
      this.failure = `data item "${item}" in ${branch} must be an object`;
      return false;
    }

    const keys = Object.keys(item);

    if (keys.length != 1) {
      this.failure = `data items in ${branch} must have only one key-pair per object`;
      return false;
    }

    for (let i in keys) {
      const key = keys[i];
      if ((/^[A-Za-z]/.exec(key) == null) || (/^[A-Za-z0-9\-_]+$/.exec(key) == null)) {
        this.failure = `data item key "${key}" in "${branch}" invalid. Keys must be strings containing only alpha numeric, dash(-) and underscore(_) characters`;
        return false;
      }

      if (branch == "root") {
        branch = key;
      }
      else {
        branch = branch + "/" + key;
      }

      if (this.verify_values(item[key], branch) == false) {
        return false;
      }
    }

    return true
  }

  verify_values(values, branch) {
    const depth = (branch.match(/\//) || []).length;
    if (typeof values !== "object") {
      this.failure = `value of ${branch} must be an object`;
      return false;
    }

    if ((protocolKey.DATA in values) == (protocolKey.TYPE in values)) {
      this.failure = `object in ${branch} must have either a "${protocolKey.DATA}" or "${protocolKey.TYPE}" key, but not both`;
      return false;
    }

    if (protocolKey.ADDR in values) {
      if (this.verify_address(values[protocolKey.ADDR], branch) == false) {
        return false;
      }

      if (this.update_addr(values[protocolKey.ADDR], depth) == false) {
        this.failure += ` at ${branch}`;
        return false;
      }
    }
    else {
      if (this.update_addr(null, depth) == false) {
        this.failure += ` at ${branch}`;
        return false;
      }
    }

    if (protocolKey.TYPE in values) {
      if (this.verify_type(values[protocolKey.TYPE], branch) == false) {
        return false;
      }
    }

    if (protocolKey.DATA in values) {
      if (this.verify_data(values, branch) == false) {
        return false;
      }
    }

    return true;
  }


  verify_address(addr, branch) {
    if (typeof addr !== "string") {
      this.failure = `"${protocolKey.ADDR}" of ${branch} must be a string`;
      return false;
    }

    if (/^[A-Fa-f0-9\-_]{4}$/.exec(addr) == null) {
      this.failure = `"${protocolKey.ADDR}" of "${addr}" in ${branch} invalid. Addresses are four character hexidecimal strings`;
      return false;
    }

    return true;
  }


  verify_type(type, branch) {
    const valid_types = ['u8', 'u16', 'u32', 'u64', 'i8', 'i16', 'i32', 'i64', 'bool', 'float', 'double', 'string', 'none'];

    if ((typeof type !== "string") && (typeof type !== "object")) {
      this.failure = `"${protocolKey.TYPE}" of "${branch}", "${type}" must be a string (or an array if (enum)`;
      return false;
    }

    if (typeof type === "string") {
      if (valid_types.includes(type) == false) {
        this.failure = `${protocolKey.TYPE}: "${type}" of "${branch}" is not a valid type, see docs for more valid types`;
        return false;
      }
    }

    if (typeof type === "object") {
      for (let i in type) {
        const item = type[i];
        if ((typeof item !== "string") || /^[A-Za-z0-9\-_]+$/.exec(item) === null) {
          this.failure = `items "${item}" in ${protocolKey.TYPE} enum of "${branch}" may only be strings using alpha-numeric characters, dashes (-) and underscores (_)`;
          return false;
        }
      }
    }

    return true;
  }

  verify_symbols(config) {
    const symbols = ["separator", "compound", "end"];

    for (let i in symbols) {
      const symbol = symbols[i];
      if ((symbol in config) == false) {
        this.failure = `Missing ${symbol} key in root data structure`;
        return false;
      }

      if ((typeof config[symbol] === "string") == false) {
        this.failure = `${symbol} must be assigned to a single character e.g. ">"`;
        return false;
      }

      if (/^[\W]{1}$/.exec(config[symbol]) == null) {
        this.failure = `${symbol} must be a single character and non-alphanumeric e.g. ">"`;
        return false;
      }
    }

    if ((config['separator'] == config['compound']) ||
      (config['separator'] == config['end']) ||
      (config['compound'] == config['end'])
    ) {
      this.failure = '"separator", "compound" and "end" characters must all be different from eachother';
      return false;
    }
    return true;
  }


  verify_category(config) {
    if (("category" in config) == false) {
      this.failure = "Missing category key in root data structure";
      return false;
    }

    const category = config['category'];
    const keys = Object.keys(category);
    const values = Object.values(category);

    if (keys.length == 0) {
      this.failure = 'There must be at least one category item';
      return false;
    }

    for (let i in keys) {
      const key = keys[i];
      if (/^[A-Za-z]/.exec(key) == null) {
        this.failure = "Category keys must be strings";
        return false;
      }

      if (/^[A-Za-z0-9\-_]+$/.exec(key) == null) {
        this.failure = "Category keys may only contain alphanumeric symbols, underscores(_) and dashes (-)";
        return false;
      }
    }


    for (let i in values) {
      const value = values[i];
      if ((typeof value === "string") == false) {
        this.failure = 'A category must be assigned to a single capital letter e.g. "C"';
        return false;
      }

      if (/^[A-Z]{1}$/.exec(value) == null) {
        this.failure = 'A category must be assigned to a single capital letter e.g. "C"';
        return false;
      }
    }

    return true;
  }


  verify_version(config) {
    if (("version" in config) == false) {
      this.failure = "Missing version key in root data structure";
      return false;
    }

    const version = config["version"];
    const keys = Object.keys(version);
    const segments = ["major", "minor", "patch"];

    for (let i in segments) {
      const segment = segments[i];
      if ((segment in version) == false) {
        this.failure = `Missing "${segment}" in "version" data structure`;
        return false;
      }

      if (Number.isInteger(version[segment]) == false) {
        this.failure = `"version" "${segment}" must be an integer`;
        return false;
      }
    }

    if (keys.length != 3) {
      this.failure = '"version" must only contain items "major", "minor" and "patch"';
      return false;
    }
    return true;
  }

  _to_addr_string(ivalue) {
    return ("0000" + ivalue.toString(16)).substr(-4);
  }

  _to_addr_int(svalue) {
    return parseInt(svalue, 16);
  }
}

