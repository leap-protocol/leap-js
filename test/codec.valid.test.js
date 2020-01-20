const assert = require('assert');
const codec = require('../src/codec.js');
const fs = require('fs');

function load_config(filename) {
  return JSON.parse(fs.readFileSync(filename));
}

describe('Codec Valid', function() {

  it('valid json file', function() {
    const c = new codec.Codec(load_config('test/fake/protocol.json'));
    assert.equal(c.valid(), true);
  });
  it('config doesnt verify', function() {
    const c = new codec.Codec(load_config("test/fake/bad-config.json"));
    assert.equal(c.valid(), false);
  });
});

