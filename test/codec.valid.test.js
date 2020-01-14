const assert = require('assert');
const codec = require('../src/codec.js');


describe('Codec Valid', function() {

  it('valid json file', function() {
    c = new codec.Codec('test/fake/protocol.json');
    assert.equal(c.valid(), true);
  });
  it('valid toml file', function() {
    c = new codec.Codec("test/fake/protocol-small.toml");
    assert.equal(c.valid(), true);
  });
  it('invalid json file', function() {
    c = new codec.Codec("test/fake/invalid-json.json");
    assert.equal(c.valid(), false);
  });
  it('invalid toml file', function() {
    c = new codec.Codec("test/fake/invalid-toml.toml");
    assert.equal(c.valid(), false);
  });
  it('config doesnt verify', function() {
    c = new codec.Codec("test/fake/bad-config.json");
    assert.equal(c.valid(), false);
  });
});

