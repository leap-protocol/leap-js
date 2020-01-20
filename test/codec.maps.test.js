const assert = require('assert');
const codec = require('../src/codec.js');
const itemData = require('../src/itemData.js');
const fs = require('fs');

function load_config(filename) {
  return JSON.parse(fs.readFileSync(filename));
}

describe('Generate Encode Map', function() {
  beforeEach(function() {
    c = new codec.Codec(load_config("test/fake/protocol-small.json"));
    this.map = c.encode_map;
  });
  it('map length', function() {
    const expected = 8;
    const result = Object.keys(this.map).length;
    assert.equal(result, expected);
  });
  it('map holds encode data', function() {
    for (key in this.map) {
      assert(this.map[key] instanceof itemData.ItemData);
    }
  });
  it('keys', function() {
    const expected = [
      "protocol",
      "protocol/version",
      "protocol/version/major",
      "protocol/version/minor",
      "protocol/version/patch",
      "protocol/name",
      "protocol/app",
      "ping"
    ];
    const result = this.map;
    for (i in expected) {
      assert(expected[i] in result);
    }
  });
  it('address data', function() {
    const keys = [
      "protocol",
      "protocol/version",
      "protocol/version/major",
      "protocol/version/minor",
      "protocol/version/patch",
      "protocol/name",
      "protocol/app",
      "ping"
    ];
    const expected = [
      "1000",
      "1001",
      "1002",
      "1003",
      "1004",
      "1005",
      "1a00",
      "2000"
    ];
    const result = [];
    for (i in keys) {
      result.push(this.map[keys[i]].addr);
    }
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
  it('branch end data', function() {
    const keys = [
      "protocol",
      "protocol/version",
      "protocol/version/major",
      "protocol/version/minor",
      "protocol/version/patch",
      "protocol/name",
      "protocol/app",
      "ping"
    ];
    const expected = [
      [
        "protocol/version/major",
        "protocol/version/minor",
        "protocol/version/patch",
        "protocol/name",
        "protocol/app"
      ],
      [
        "protocol/version/major",
        "protocol/version/minor",
        "protocol/version/patch"
      ],
      [ "protocol/version/major" ],
      [ "protocol/version/minor" ],
      [ "protocol/version/patch" ],
      [ "protocol/name" ],
      [ "protocol/app" ],
      [ "ping" ]
    ];
    const result = [];
    for (i in keys) {
      result.push(this.map[keys[i]].data_branches);
    }
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
  it('types data', function() {
    const keys = [
      "protocol",
      "protocol/version",
      "protocol/version/major",
      "protocol/version/minor",
      "protocol/version/patch",
      "protocol/name",
      "protocol/app",
      "ping"
    ];
    const expected = [
      [ "u8", "u8", "u16", "string", "string" ],
      [ "u8", "u8", "u16" ],
      [ "u8" ],
      [ "u8" ],
      [ "u16" ],
      [ "string" ],
      [ "string" ],
      [ "none" ]
    ];
    const result = [];
    for (i in keys) {
      result.push(this.map[keys[i]].types);
    }
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
});

describe('Generate Decode Map', function() {
  beforeEach(function() {
    c = new codec.Codec(load_config("test/fake/protocol-small.json"));
    this.map = c.decode_map;
  });
  it('map length', function() {
    const expected = 8;
    const result = Object.keys(this.map).length;
    assert.equal(result, expected);
  });
  it('map holds encode data', function() {
    for (key in this.map) {
      assert(this.map[key] instanceof itemData.ItemData);
    }
  });
  it('keys', function() {
    expected = [
      "1000",
      "1001",
      "1002",
      "1003",
      "1004",
      "1005",
      "1a00",
      "2000"
    ];
    const result = this.map;
    for (i in expected) {
      assert(expected[i] in result);
    }
  });
  it('path data', function() {
    const keys = [
      "1000",
      "1001",
      "1002",
      "1003",
      "1004",
      "1005",
      "1a00",
      "2000"
    ];
    const expected = [
      "protocol",
      "protocol/version",
      "protocol/version/major",
      "protocol/version/minor",
      "protocol/version/patch",
      "protocol/name",
      "protocol/app",
      "ping"
    ]
    const result = [];
    for (i in keys) {
      result.push(this.map[keys[i]].path);
    }
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
  it('branch end data', function() {
    const keys = [
      "1000",
      "1001",
      "1002",
      "1003",
      "1004",
      "1005",
      "1a00",
      "2000"
    ];
    const expected = [
      [
        "protocol/version/major",
        "protocol/version/minor",
        "protocol/version/patch",
        "protocol/name",
        "protocol/app"
      ],
      [
        "protocol/version/major",
        "protocol/version/minor",
        "protocol/version/patch"
      ],
      [ "protocol/version/major" ],
      [ "protocol/version/minor" ],
      [ "protocol/version/patch" ],
      [ "protocol/name" ],
      [ "protocol/app" ],
      [ "ping" ]
    ];
    const result = [];
    for (i in keys) {
      result.push(this.map[keys[i]].data_branches);
    }
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
  it('types data', function() {
    const keys = [
      "1000",
      "1001",
      "1002",
      "1003",
      "1004",
      "1005",
      "1a00",
      "2000"
    ];
    const expected = [
      [ "u8", "u8", "u16", "string", "string" ],
      [ "u8", "u8", "u16" ],
      [ "u8" ],
      [ "u8" ],
      [ "u16" ],
      [ "string" ],
      [ "string" ],
      [ "none" ]
    ];
    const result = [];
    for (i in keys) {
      result.push(this.map[keys[i]].types);
    }
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
})