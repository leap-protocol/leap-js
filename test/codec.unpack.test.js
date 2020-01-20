const assert = require('assert');
const codec = require('../src/codec.js');
const packet = require('../src/packet.js');
const fs = require('fs');

function load_config(filename) {
  return JSON.parse(fs.readFileSync(filename));
}

describe('PacketPayloadUnpack', function() {
  beforeEach(function() {
    this.codec = new codec.Codec(load_config("test/fake/protocol.json"));
  });
  it('test_unpack_simple', function() {
    expected = {"protocol/version/major": 5};
    _packet = new packet.Packet("pub", "protocol/version/major", 5);
    result = this.codec.unpack(_packet);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
  it('unpack_multiple', function() {
    expected = {
      "protocol/version/major": 5,
      "protocol/version/minor": 4,
      "protocol/version/patch": 3,
    };
    _packet = new packet.Packet("pub", "protocol/version", [5, 4, 3]);
    result = this.codec.unpack(_packet);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
  it('unpack_partial', function() {
    expected = {
      "protocol/version/major": 5,
      "protocol/version/minor": 4
    };
    _packet = new packet.Packet("pub", "protocol/version", [5, 4]);
    result = this.codec.unpack(_packet);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
  it('unpack_overflow', function() {
    expected = {
      "protocol/version/major": 5,
      "protocol/version/minor": 4,
      "protocol/version/patch": 3
    };
    _packet = new packet.Packet("pub", "protocol/version", [5, 4, 3, 2]);
    result = this.codec.unpack(_packet);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
  it('unpack_settable', function() {
    expected = {"typecheck/uint32": 0x12345};
    _packet = new packet.Packet("pub", "typecheck/uint32", 0x12345);
    result = this.codec.unpack(_packet);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
  it('unpack_explore', function() {
    expected = {
      "imu/accel/x": 12.0,
      "imu/accel/y": 23.0,
      "imu/accel/z": 45.0,
      "imu/gyros/x": 67.0,
      "imu/gyros/y": 89.0,
      "imu/gyros/z": 12.0,
      "imu/magne/x": 34.0,
      "imu/magne/y": 56.0,
      "imu/magne/z": 78.0
    };
    _packet = new packet.Packet(
      "pub",
      "imu",
      [12.0, 23.0, 45.0, 67.0, 89.0, 12.0, 34.0, 56.0, 78.0]
    );
    result = this.codec.unpack(_packet);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
});
