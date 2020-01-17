const assert = require('assert');
const cli_parse = require('../src/cliParse.js');
const toml = require('toml');
const yaml = require('js-yaml');


describe('Basic CLI commands', function() {
  it('generate', function() {
    process.argv = ['node','cli.test.js'];
    result = cli_parse.cli_parse();
    assert("generate" in result);
  });
  it('validate', function() {
    process.argv = ['node','cli.test.js'];
    result = cli_parse.cli_parse();
    assert("validate" in result);
  });
});

describe('Generate CLI', function() {
  it ('no generate is null by default', function() {
    process.argv = ['node','cli.test.js'];
    result = cli_parse.cli_parse();
    assert.equal(result.generate, null);
  });
  it ('generate filename json', function() {
    process.argv = ['node','cli.test.js', '--generate', 'new.json'];
    result = cli_parse.cli_parse();
    assert.equal(result.generate, 'new.json');
  });
  it ('generate filename yaml', function() {
    process.argv = ['node','cli.test.js', '--generate', 'new.yaml'];
    result = cli_parse.cli_parse();
    assert.equal(result.generate, 'new.yaml');
  });
  it ('generate filename toml', function() {
    process.argv = ['node','cli.test.js', '--generate', 'new.toml'];
    result = cli_parse.cli_parse();
    assert.equal(result.generate, 'new.toml');
  });
  it ('generate converts to yaml by default', function() {
    process.argv = ['node','cli.test.js', '--generate', 'new'];
    result = cli_parse.cli_parse();
    assert.equal(result.generate, 'new.yaml');
  });
  it ('generate appends to irrelevant extension', function() {
    process.argv = ['node','cli.test.js', '--generate', 'new.js'];
    result = cli_parse.cli_parse();
    assert.equal(result.generate, 'new.js.yaml');
  });
  it ('handle empty string', function() {
    process.argv = ['node','cli.test.js', '--generate', ''];
    result = cli_parse.cli_parse();
    assert.equal(result.generate, 'config.yaml');
  });
});

