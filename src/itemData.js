// Copyright © 2020 Hoani Bryson
// License: MIT (https://mit-license.org/)
//
// Item Data
//
// A structure for consolodating item properties
//

exports.ItemData = class ItemData {
  constructor(path, addr, data_branches, types) {
    this.addr = addr;
    this.path = path;
    this.data_branches = data_branches;
    this.types = types;
  }
}