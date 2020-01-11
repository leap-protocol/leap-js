const assert = require('assert');
const codec = require('../src/codec.js');

CONFIG_PATH = "test/fake/protocol-small.json"

describe('Generate Encode Map', function() {
  it('Passing Test', function() {
    const expected = 8;
    const c = new codec.Codec(CONFIG_PATH);
    const result = Object.keys(c.encode_map).length;
    assert.equal(result, expected);
  });
});