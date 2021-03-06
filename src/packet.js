// Copyright © 2020 Hoani Bryson
// License: MIT (https://mit-license.org/)
//
// Packet
//
// The decoded L3aP packet object
//

exports.Packet = class Packet {
  constructor(category, path=null, payload=null) {
    this.category = category;
    this.paths = [];
    this.payloads = [];
    if (path != null) {
      this.add(path, payload);
    }
  }

  add(path, payload=null) {
    this.paths.push(path);
    if (typeof payload != "object" && payload != null) {
      this.payloads.push([payload])
    }
    else {
      this.payloads.push(payload)
    }
  }

  unpack(codec) {
    return codec.unpack(this)
  }
}