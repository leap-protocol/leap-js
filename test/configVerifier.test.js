const assert = require('assert');
const toml = require('toml');
const fs= require('fs');
const configVerifier = require('../src/configVerifier');

function open_json(filepath) {
  return JSON.parse(fs.readFileSync(filepath));
}

function open_toml(filepath) {
  return toml.parse(fs.readFileSync(filepath));
}

describe('VerifyBasic', function() {
  beforeEach(function() {
    this.verifier = new configVerifier.ConfigVerifier();
    this.valid_json = "test/fake/protocol.json";
    this.valid_small_json = "test/fake/protocol-small.json";
    this.valid_toml = "test/fake/protocol.toml";
    this.valid_small_toml = "test/fake/protocol-small.toml";
  });
  it('valid json', function() {
    const config = open_json(this.valid_json);
    assert.equal(this.verifier.verify(config), true);
  });
  it('valid small json', function() {
    const config = open_json(this.valid_small_json);
    assert.equal(this.verifier.verify(config), true);
  });
  it('valid toml', function() {
    const config = open_toml(this.valid_toml);
    assert.equal(this.verifier.verify(config), true);
  });
  it('valid small toml', function() {
    const config = open_toml(this.valid_small_toml);
    assert.equal(this.verifier.verify(config), true);
  });
  it('invalid empty', function() {
    const config = [];
    assert.equal(this.verifier.verify(config), false);
  });
});

describe('VerifyData', function() {
  beforeEach(function() {
    this.verifier = new configVerifier.ConfigVerifier();
    this.valid = "test/fake/protocol.json";
    this.config = open_json(this.valid);
  });
  it('no_data', function() {
    delete this.config.data;
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('data is not an object', function() {
    this.config['data'] = 10;
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('incorrect_data_type', function() {
    this.config['data'] = {'item': {"type": "string"}};
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('data_is_empty', function() {
    this.config['data'] = [];
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('data_contains_the_wrong_items', function() {
    this.config['data'] = [1, 2];
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('item_has_no_data', function() {
    this.config['data'] = [{}];
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('item_has_too_many_keys', function() {
    this.config['data'] = [{"item1": {"type": "string"}, "item2": {"type": "string"}}];
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('item_has_an_empty_key', function() {
    this.config['data'] = [{"": {"type": "string"}}];
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('item_key_must_be_string', function() {
    this.config['data'] = [{2: {"type": "string"}}];
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('item_has_whitespace_in_key', function() {
    this.config['data'] = [{"an item": {"type": "string"}}];
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('item_has_invalid_character_in_key', function() {
    this.config['data'] = [{"an/item": {"type": "string"}}];
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('item_has_invalid_value_type', function() {
    this.config['data'] = [{"item": 1}];
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('item_has_empty_map', function() {
    this.config['data'] = [{"item": {}}];
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('item_does_not_contain_data_or_type', function() {
    this.config['data'] = [{"item": {"addr": "0000"}}];
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('first address not required', function() {
    delete this.config['data'][0]['protocol']['addr'];
    assert.equal(this.verifier.verify(this.config), true);
  });
  it('invalid_address_value_type', function() {
    this.config['data'][0]['protocol']['addr'] = 0x1000;
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_address_too_big', function() {
    this.config['data'][0]['protocol']['addr'] = "10000";
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_address_too_small', function() {
    this.config['data'][0]['protocol']['addr'] = "100";
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_address_not_a_number', function() {
    this.config['data'][0]['protocol']['addr'] = "FIVE";
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_address_not_hex', function() {
    this.config['data'][0]['protocol']['addr'] = "55.5";
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('cant_have_type_and_data', function() {
    this.config['data'][0]['protocol']['type'] = "bool";
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('type_not_string', function() {
    this.config['data'][1]['ping']['type'] = 1;
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('type_not_valid', function() {
    this.config['data'][1]['ping']['type'] = 'invalid'
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_enum_types', function() {
    this.config['data'][1]['ping']['type'] = [1, 2, 3];
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_enum_strings', function() {
    this.config['data'][1]['ping']['type'] = ["test", "test?"];
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_enum_empty_string', function() {
    this.config['data'][1]['ping']['type'] = ["test", ""];
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('addr_must_increase', function() {
    this.config['data'][0]['protocol']['addr'] = "2000";
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('addr_exceeds_limit', function() {
    this.config['data'].push({ 'new' : { "addr": "FFFF", "type": "u8" }});
    this.config['data'].push({ 'overflow' : { "type": "u8" }});
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_buried_deep', function() {
    this.config['data'][3]["imu"]["data"][1]["gyros"]["data"][2]["z"] = { "type": "invalid"};
    assert.equal(this.verifier.verify(this.config), false);
  });
});

describe('VerifySymbols', function() {
  beforeEach(function() {
    this.verifier = new configVerifier.ConfigVerifier();
    this.valid = "test/fake/protocol.json";
    this.config = open_json(this.valid);
  });
  it('no_separator', function() {
    delete this.config.separator;
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('no_compound', function() {
    delete this.config.compound;
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('no_end', function() {
    delete this.config.end;
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_separator_type', function() {
    this.config['separator'] = {};
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_compound_type', function() {
    this.config['compound'] = 1
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_end_type', function() {
    this.config['end'] = ["?"];
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_separator_length', function() {
    this.config['separator'] = "::";
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_compound_length', function() {
    this.config['compound'] = "";
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_end_length', function() {
    this.config['end'] = "><";
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_separator_charater', function() {
    this.config['separator'] = "9";
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_compound_character', function() {
    this.config['compound'] = "b";
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_end_character', function() {
    this.config['end'] = "A";
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_separator_is_compound', function() {
    this.config['separator'] = this.config['compound'];
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_separator_is_end', function() {
    this.config['separator'] = this.config['end'];
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_end_is_compound', function() {
    this.config['end'] = this.config['compound'];
    assert.equal(this.verifier.verify(this.config), false);
  });
});

describe('VerifyCategory', function() {
  beforeEach(function() {
    this.verifier = new configVerifier.ConfigVerifier();
    this.valid = "test/fake/protocol.json";
    this.config = open_json(this.valid);
  });
  it('no_category', function() {
    delete this.config.category;
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_category_length', function() {
    this.config['category'] = {};
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_category_key', function() {
    this.config['category'][1] = "L";
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_category_key_whitespace', function() {
    this.config['category']["L O"] = "L";
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_category_key_period', function() {
    this.config['category'][".in"] = "L";
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_category_key_empty', function() {
    this.config['category'][""] = "L";
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_category_value_type', function() {
    this.config['category']["tes"] = true
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_category_value_length', function() {
    this.config['category']["tes"] = "TE";
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_category_value_symbol', function() {
    this.config['category']["tes"] = ".";
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_category_value_number', function() {
    this.config['category']["tes"] = "0";
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_category_value_case', function() {
    this.config['category']["tes"] = "l";
    assert.equal(this.verifier.verify(this.config), false);
  });
});


describe('VerifyVersion', function() {
  beforeEach(function() {
    this.verifier = new configVerifier.ConfigVerifier();
    this.valid = "test/fake/protocol.json";
    this.config = open_json(this.valid);
  });
  it('no_version', function() {
    delete this.config.version;
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('no_major_version', function() {
    delete this.config.version.major;
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('no_minor_version', function() {
    delete this.config.version.minor;
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('no_patch_version', function() {
    delete this.config.version.patch;
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('too_many_version_items', function() {
    this.config['version']['fake'] = 2
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_major_version', function() {
    this.config['version']['major'] = 1.2
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_minor_version', function() {
    this.config['version']['minor'] = "2";
    assert.equal(this.verifier.verify(this.config), false);
  });
  it('invalid_patch_version', function() {
    this.config['version']['patch'] = null
    assert.equal(this.verifier.verify(this.config), false);
  });
});
