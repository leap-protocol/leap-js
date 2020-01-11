const assert = require('assert');
const explore = require('../src/explore.js');

CONFIG_PATH = "test/fake/protocol.json";

countries_root = {
  data: [
  { NZ: { data: [
    { Auckland: { data: [
      { GlenInnes: { type: "u16"  } },
      { Avondale: { type: "float" } }
    ] } },
    { Hamilton: { type: "u8"  } },
    { Napier: { type: "bool" } }
  ] } },
  { Rarotonga: { type: "i32" } }
] };


describe('Get Struct', function() {
  it('Get none', function() {
    const expected = null;
    const result = explore.get_struct(countries_root, ["Florida"])
    assert.equal(result, expected);
  });
  it('Get last', function() {
    const expected = { type: "i32" };
    const result = explore.get_struct(countries_root, ["Rarotonga"])
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
  it('Get deep', function() {
    const expected = { type: "float" };
    const result = explore.get_struct(countries_root, ["NZ", "Auckland", "Avondale"])
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
  it('Get another', function() {
    const expected = { type: "bool" };
    const result = explore.get_struct(countries_root, ["NZ", "Napier"])
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
  it('Get no path', function() {
    const expected = countries_root;
    const result = explore.get_struct(countries_root, [])
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
});



