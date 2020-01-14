const utf8 = require("utf8");

exports.Codec = class Codec {
  constructor(config_file_path) {
    this.filepath = config_file_path;
    this._config = {};
    this.valid = true;
    this.encode_called = false;
    this.decode_called = false;
    this.unpack_called = false;
    this.unpack_return = {};
  }

  is_valid() {
    return this.valid;
  }

  encode(packets) {
    this.encode_called = true;
    return utf8.encode("");
  }

  decode(encoded) {
    this.decode_called = true;
    return [utf8.encode(""), []];
  }

  unpack(packet) {
    this.unpack_called = true
    return this.unpack_return
  }
}


