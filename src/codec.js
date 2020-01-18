// Copyright © 2020 Hoani Bryson
// License: MIT (https://mit-license.org/)
//
// Codec
//
// L3aP codec for encoding and decoding packets
//

const fs = require('fs');
const utf8 = require('utf8');
const toml = require('toml');
const yaml = require('js-yaml');
const packet = require('./packet');
const typeCodec = require('./typeCodec');
const mapGenerator = require('./mapGenerator');
const verify = require('./verify');


exports.Codec = class Codec {
  constructor(filepath) {
    let data;
    this.is_valid = false;
    this.encode_map = {};
    this.decode_map = {};
    this.start_to_category_map = {};

    try {
      data = fs.readFileSync(filepath);
      this.is_valid = true;
    }
    catch (err) {
      this.is_valid = false;
      console.log("invlaid file");
    }

    if (this.is_valid) {
      try {
        this._config = JSON.parse(data);
      }
      catch {
        try {
          this._config = toml.parse(data);
        }
        catch {
          try {
            this._config = yaml.load(data);
          }
          catch {
            this.is_valid = false;
          }
        }
      }
    }

    if (this.is_valid) {
      if (verify.verify_quiet(filepath)) {
        [this.encode_map, this.decode_map] = mapGenerator.generate_maps(
          this._config
        );
        this._map_categories();
      }
      else {
        this.is_valid = false;
      }
    }
  }

  valid() {
    return this.is_valid;
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
            console.log(`Could not encode with invalid branch: ${path}`);
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


  decode(encoded) {
    if (this._is_valid == false) {
      return [encoded, []];
    }

    let strings = encoded.split(
      utf8.encode(this._config["end"])
    );
    const remainder = strings.slice(strings.length-1, strings.length);
    const packets = [];

    if (strings.length == 1) {
      return [remainder, []];
    }

    strings = strings.slice(0, strings.length - 1);

    for(let i in strings) {
      let string = strings[i];
      string = utf8.decode(string);
      const start = string[0];
      const category = this._category_from_start(start);
      const _packet = new packet.Packet(category);

      string = string.slice(1, string.length);
      const subpackets = string.split(this._config["compound"]);

      for (let j in subpackets) {
        const subpacket = subpackets[j];
        const parts = subpacket.split(this._config["separator"]);

        if (parts != ['']) {
          const payload = [];
          const addr = parts[0];
          const decode_data = this.decode_map[addr];
          const encoded_payload = parts.slice(1, parts.length);

          for (let k = 0; k < encoded_payload.length; k++) {
            const item = encoded_payload[k];
            const type = decode_data.types[k];
            payload.push(typeCodec.decode_types(item, type));
          }

          _packet.add(decode_data.path, payload);
        }
      }

      packets.push(_packet);
    }

    return [remainder, packets];
  }

  unpack(_packet) {
    const result = {};
    for (let i = 0; i < _packet.paths.length; i++) {
      const path = _packet.paths[i];
      const payload = _packet.payloads[i];
      const unpack_data = this.encode_map[path];

      const value_count = Math.min(
        payload.length,
        unpack_data.data_branches.length
        );

      for (let j = 0; j < value_count; j++) {
        const branch = unpack_data.data_branches[j];
        const value = payload[j];
        result[branch] = value;
      }
    }
    return result;
  }

  _map_categories() {
    const categories = this._config['category'];
    const keys = Object.keys(categories);

    for (i in keys) {
      const key = keys[i];
      const start = categories[key];

      this.start_to_category_map[start] = key;
    }
  }

  _category_from_start(start) {
    return this.start_to_category_map[start];
  }

}
