const assert = require('assert');
const toml = require('toml');
const fs= require('fs');
const packet = require('../src/packet.js');
const codec = require('./fake/fakeCodec.js');



describe('Packet Instantiation', function() {
  beforeEach(function() {
  });
  it('create packet', function() {
    p = new packet.Packet("get", "protocol", []);
    assert.equal(p instanceof packet.Packet, true);
  });
  it('contents', function() {
    p = new packet.Packet("set", "protocol", [1,2,3]);
    assert.equal(p.category, "set")
    assert.equal(p.paths[0], "protocol")
    assert.equal(p.payloads[0][0], 1)
    assert.equal(p.payloads[0][1], 2)
    assert.equal(p.payloads[0][2], 3)
    assert.equal(p.paths.length, 1);
    assert.equal(p.payloads.length, 1);
    assert.equal(p.payloads[0].length, 3);
  });
});

describe('Packet Instantiation', function() {
  beforeEach(function() {
    this.codec = new codec.Codec("")
  });
  it('unpack', function() {
    expected = {"protocol/version/major": {"value": 5, "set": false}};
    this.codec.unpack_return = expected;
    _packet = new packet.Packet("pub");
    result = _packet.unpack(this.codec);
    assert.equal(this.codec.unpack_called, true)
    assert.equal(result, expected)
  });
});



