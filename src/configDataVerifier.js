
const protocolKey = require('./protocolKey.js');


exports.DataVerifier = class DataVerifier {
  constructor() {
    this.reset();
  }

  reset() {
    this.section = "";
    this.failure = "";
    this.addr = [];
    this.current_addr = null;
    this.depth = -1;
  }

  verify(config) {
    this.reset();

    if (this.verify_data(config, "root") == false) {
      this.section = "Data";
    }
    else {
      return true;
    }

    return false;
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

    if (this.current_addr != null) {
      if (next_addr <= this._to_addr_int(this.current_addr)) {
        this.failure = `Next address ${this._to_addr_string(next_addr)} is lower than previous address ${this.current_addr}`;
      }
      else if (next_addr > 0xFFFF) {
        this.failure = `Next address 0x${this._to_addr_string(next_addr)} has overrun 0xFFFF`;
      }
    }

    if (this.failure !== "") {
      return false;
    }
    else {
      this.current_addr = this._to_addr_string(next_addr);
      return true;
    }
  }

  get_failure() {
    return this.failure;
  }

  get_section() {
    return this.section;
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

  _to_addr_string(ivalue) {
    return ("0000" + ivalue.toString(16)).substr(-4);
  }

  _to_addr_int(svalue) {
    return parseInt(svalue, 16);
  }
}

