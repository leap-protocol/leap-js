const assert = require('assert');
const explore = require('../src/explore.js');
const fs = require('fs');

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


describe('Count to path', function() {
  it('Bad Root', function() {
    const expected = null;
    const result = explore.count_to_path(countries_root['data'], null);
    assert.equal(result, expected);
  });
  it('Null will count depth', function() {
    const expected = 7;
    const result = explore.count_to_path(countries_root, null);
    assert.equal(result, expected);
  });
  it('Direct one deep', function() {
    const expected = 1;
    const result = explore.count_to_path(countries_root, ['NZ']);
    assert.equal(result, expected);
  });
  it('Direct two deep', function() {
    const expected = 2;
    const result = explore.count_to_path(countries_root, ['NZ', 'Auckland']);
    assert.equal(result, expected);
  });
  it('Direct three deep', function() {
    const expected = 3;
    const result = explore.count_to_path(countries_root, ['NZ', 'Auckland', 'GlenInnes']);
    assert.equal(result, expected);
  });
  it('Three deep', function() {
    const expected = 4;
    const result = explore.count_to_path(countries_root, ['NZ', 'Auckland', 'Avondale']);
    assert.equal(result, expected);
  });
  it('Two deep', function() {
    const expected = 6;
    const result = explore.count_to_path(countries_root, ['NZ', 'Napier']);
    assert.equal(result, expected);
  });
  it('Invalid path', function() {
    const expected = null;
    const result = explore.count_to_path(countries_root, ['NZ', 'Christchurch']);
    assert.equal(result, expected);
  });
});

describe('Get Struct', function() {
  it("Bad root", function() {
    const expected = null;
    const result = explore.get_struct(countries_root['data'], ["Rarotonga"]);
    assert.equal(result, expected);
  });
  it('Get none', function() {
    const expected = null;
    const result = explore.get_struct(countries_root, ["Florida"]);
    assert.equal(result, expected);
  });
  it('Get last', function() {
    const expected = { type: "i32" };
    const result = explore.get_struct(countries_root, ["Rarotonga"]);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
  it('Get deep', function() {
    const expected = { type: "float" };
    const result = explore.get_struct(countries_root, ["NZ", "Auckland", "Avondale"]);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
  it('Get another', function() {
    const expected = { type: "bool" };
    const result = explore.get_struct(countries_root, ["NZ", "Napier"]);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
  it('Get no path', function() {
    const expected = countries_root;
    const result = explore.get_struct(countries_root, []);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
});

describe('Extract Types', function() {
  beforeEach(function() {
    this.root = JSON.parse(
      fs.readFileSync(CONFIG_PATH)
    );
  });
  it('Invalid path', function() {
    const expected = [];
    const result = explore.extract_types(this.root, ["invalid"]);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
  it('Simple type', function() {
    const expected = ["bool"];
    const result = explore.extract_types(this.root, ["ping"]);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
  it('Nested type', function() {
    const expected = ["u16"];
    const result = explore.extract_types(this.root, ["protocol", "version", "patch"]);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
  it('Multiple types', function() {
    const expected = ["u8", "u8", "u16"];
    const result = explore.extract_types(this.root, ["protocol", "version"]);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
  it('Multiple types nested', function() {
    const expected = ["u8", "u8", "u16", "string"];
    const result = explore.extract_types(this.root, ["protocol"]);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
  it('Ignore bad item', function() {
    delete this.root.data[0].protocol.data[0].version.data;
    const expected = ["string"];
    const result = explore.extract_types(this.root, ["protocol"]);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
});

describe('Extract Decendants', function() {
  beforeEach(function() {
    this.root = JSON.parse(
      fs.readFileSync(CONFIG_PATH)
    );
  });
  it('Invalid path', function() {
    const expected = [];
    const result = explore.extract_decendants(this.root, ["invalid"]);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
  it('No decendant', function() {
    const expected = [""];
    const result = explore.extract_decendants(this.root, ["ping"]);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
  it('Multiple decendants', function() {
    const expected = ["major", "minor", "patch"];
    const result = explore.extract_decendants(this.root, ["protocol", "version"]);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
  it('Multilevel', function() {
    const expected = ["version/major", "version/minor", "version/patch", "name"];
    const result = explore.extract_decendants(this.root, ["protocol"]);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
});

describe('Extract Branches', function() {
  beforeEach(function() {
    this.root = JSON.parse(
      fs.readFileSync(CONFIG_PATH)
    );
  });
  it('Invalid path', function() {
    const expected = [];
    const result = explore.extract_branches(this.root, ["invalid"]);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
  it('None', function() {
    const expected = [""];
    const result = explore.extract_branches(this.root, ["health", "batt", "v"]);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
  it('Single', function() {
    const expected = ["v"];
    const result = explore.extract_branches(this.root, ["health", "batt"]);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
  it('Multiple', function() {
    const expected = ["major", "minor", "patch"];
    const result = explore.extract_branches(this.root, ["protocol", "version"]);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
  it('Multilevel', function() {
    const expected = ["version", "version/major", "version/minor", "version/patch", "name"];
    const result = explore.extract_branches(this.root, ["protocol"]);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });
});


