// Copyright © 2020 Hoani Bryson
// License: MIT (https://mit-license.org/)
//
// Map Generator
//
// Processes configuration into simple map lookups for fast encoding
//

const itemData = require('./itemData');
const explore = require('./explore');
const protocolKey = require('./protocolKey');

exports.generate_maps = function generate_maps(protocol_root) {
  const branches = explore.extract_branches(protocol_root, []);
  const addr_path = [];
  const roots = [];
  const encode_map = {};
  const decode_map = {};

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
        const int_addr = to_addr_int(addr_path[depth-1]) +
          to_addr_int(root[protocolKey.ADDR]);
        addr_path[depth] = to_addr_string(int_addr);
      }
    }
    else {
      if (addr_path[0] == "") {
        // Default first entry
        addr_path[0] = "0000";
      }
      else {
        // When address is not specified, increment by one
        addr_path[depth] = to_addr_string(
          to_addr_int(addr_path[prev_depth]) + 1
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
    encode_map[branch] = item_data;
    decode_map[addr] = item_data;
  }
  return [encode_map, decode_map];
}



function to_addr_string(ivalue) {
  return ("0000" + ivalue.toString(16)).substr(-4);
}

function to_addr_int(svalue) {
  return parseInt(svalue, 16);
}

