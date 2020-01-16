const assert = require('assert');
const cli_parse = require('../src/cliParse.js');


describe('Basic CLI commands', function() {
  it('generate', function() {
    process.argv = ['node','cli.test.js'];
    result = cli_parse.cli_parse();
    assert("generate" in result);
  });
});

