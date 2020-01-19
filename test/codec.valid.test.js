const assert = require('assert');
const codec = require('../src/codec.js');
const loadConfig = require('../src/loadConfig.js');

function load_config(filename) {
  const loader = new loadConfig.LoadConfig(filename);
  return loader.config();
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

