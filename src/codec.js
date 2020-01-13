const fs = require('fs');
const utf8 = require('utf8');
const packet = require('./packet');
const explore = require('./explore');
const typeCodec = require('./typeCodec');
const protocolKey = require('./protocolKey');
const itemData = require('./itemData');


exports.Codec = class Codec {
  constructor(filepath) {
    let data;
    this.valid = false;
    this.encode_map = {};
    this.decode_map = {};

    try {
      data = fs.readFileSync(filepath);
      this.valid = true;
    }
    catch (err) {
      this.valid = false;
      console.log("invlaid file");
    }


    if (this.valid) {
      this._config = JSON.parse(data);
      this._generate_maps(this._config);
    }
  }

  encode(packets){
    if (this._is_valid == false) {
      return utf8.encode("");
    }
    if ((packets instanceof packet.Packet) == true) {
      packets = [packets];
    }
    else if (typeof packets != "object") {
      return utf8.encode("");
    }

    let encoded = "";

    for (let i in packets) {
      const _packet = packets[i];
      let internal = "";

      if (encoded != "") {
        encoded += this._config["end"];
      }
      encoded += this._config["category"][_packet.category]

      for (let j in _packet.paths) {
        const path = _packet.paths[j];
        const payload = _packet.payloads[j];

        if (path != null) {
          let encode_data;
          // Detect compound packet and add compound character
          if (internal != "") {
            internal += this._config["compound"];
          }

          if (path in this.encode_map) {
            encode_data = this.encode_map[path];
          }
          else {
            console.log(`Cound not encode with invalid branch: ${path}`);
            return utf8.encode("");
          }

          internal += encode_data.addr;

          if (payload != null) {
            const count = Math.min(encode_data.types.length, payload.length);
            for (let i = 0; i < count; i++) {
              internal += this._config["separator"];
              internal += typeCodec.encode_types(payload[i], encode_data.types[i]);
            }
          }
        }
      }
      encoded += internal
    }
    encoded += this._config["end"];
    return utf8.encode(encoded);
  }

  _generate_maps(protocol_root) {
    const count = explore.count_to_path(protocol_root, null);
    const branches = explore.extract_branches(protocol_root, []);
    const addr_path = [];
    const roots = [];
    let addr = 0;
    let prev_depth = 0;
    let max_depth = -1;
    // gather the corresponding data structures for each branch
    for (let i in branches) {
      const branch = branches[i];
      roots.push(explore.get_struct(protocol_root, branch.split('/')));
    }

    // This loop populates the correct data for every possible address
    // defined in the protocol
    for (let i in roots) {
      const root = roots[i];
      const branch = branches[i];
      const depth = (branch.match(/\//) || []).length;

      // When we burrow to a new address nesting, ensure the address
      // tracking has an entry ready to be updated
      if (max_depth < depth) {
        addr_path.push("");
      }

      // Handle address generation.
      // If the branch defines no address it is incremented
      // If it does have an address, we use the nested addressing rules
      // See leap-protocol.github.io for more details
      if (protocolKey.ADDR in root) {
        if (depth == 0) {
          // The root depth sets address explicitly
          addr_path[depth] = root[protocolKey.ADDR];
        }
        else {
          // Nested address specifications add to specified addresses further up
          // the chain.
          const int_addr = this._to_addr_int(addr_path[depth-1]) +
            this._to_addr_int(root[protocolKey.ADDR]);
          addr_path[depth] = this._to_addr_string(int_addr);
        }
      }
      else {
        if (addr_path[0] == "") {
          // Default first entry
          addr_path[0] = "0000";
        }
        else {
          // When address is not specified, increment by one
          addr_path[depth] = this._to_addr_string(
            this._to_addr_int(addr_path[prev_depth]) + 1
          );
        }
      }

      // Configure address depths for the next branch
      prev_depth = depth;
      max_depth = Math.max(max_depth, depth);
      addr = addr_path[depth];


      // Extract a list of branches which come off the current address
      const data_branches = [];
      const ends = explore.extract_decendants(root, []);
      for (i in ends) {
        const end = ends[i];
        if (end != "") {
          data_branches.push(
            [branch, end].join('/')
          );
        }
        else {
          data_branches.push(branch);
        }
      }

      // Extract a set of types associated with all branches coming off the
      // current address
      const types = explore.extract_types(root, []);

      const item_data = new itemData.ItemData(branch, addr, data_branches, types);
      this.encode_map[branch] = item_data;
      this.decode_map[addr] = item_data;
    }
  }


  _to_addr_string(ivalue) {
    return ("0000" + ivalue.toString(16)).substr(-4);
  }

  _to_addr_int(svalue) {
    return parseInt(svalue, 16);
  }

}
