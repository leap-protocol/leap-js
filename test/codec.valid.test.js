const assert = require('assert');
const codec = require('../src/codec.js');


describe('Codec Valid', function() {

  it('valid json file', function() {
    const c = new codec.Codec('test/fake/protocol.json');
    assert.equal(c.valid(), true);
  });
  it('valid toml file', function() {
    const c = new codec.Codec("test/fake/protocol-small.toml");
    assert.equal(c.valid(), true);
  });
  it('valid yaml file', function() {
    const c = new codec.Codec("test/fake/protocol-small.yaml");
    assert.equal(c.valid(), true);
  });
  it('invalid json file', function() {
    const c = new codec.Codec("test/fake/invalid-json.json");
    assert.equal(c.valid(), false);
  });
  it('invalid toml file', function() {
    const c = new codec.Codec("test/fake/invalid-toml.toml");
    assert.equal(c.valid(), false);
  });
  it('config doesnt verify', function() {
    const c = new codec.Codec("test/fake/bad-config.json");
    assert.equal(c.valid(), false);
  });
  it('file doesnt exist', function() {
    const c = new codec.Codec("test/fake/non-existant-config.json");
    assert.equal(c.valid(), false);
  });
});

