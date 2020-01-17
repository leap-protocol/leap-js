const assert = require('assert');
const cli_parse = require('../src/cliParse.js');
const toml = require('toml');
const yaml = require('js-yaml');


describe('Generate CLI', function() {
  it ('generate filename json', function() {
    process.argv = ['node','cli.test.js', 'generate', 'new.json'];
    result = cli_parse.cli_parse();
    assert.equal(result.generate, 'new.json');
  });
  it ('generate filename yaml', function() {
    process.argv = ['node','cli.test.js', 'generate', 'new.yaml'];
    result = cli_parse.cli_parse();
    assert.equal(result.generate, 'new.yaml');
  });
  it ('generate filename toml', function() {
    process.argv = ['node','cli.test.js', 'generate', 'new.toml'];
    result = cli_parse.cli_parse();
    assert.equal(result.generate, 'new.toml');
  });
  it ('generate converts to yaml by default', function() {
    process.argv = ['node','cli.test.js', 'generate', 'new'];
    result = cli_parse.cli_parse();
    assert.equal(result.generate, 'new.yaml');
  });
  it ('generate appends to irrelevant extension', function() {
    process.argv = ['node','cli.test.js', 'generate', 'new.js'];
    result = cli_parse.cli_parse();
    assert.equal(result.generate, 'new.js.yaml');
  });
  it ('handle empty string', function() {
    process.argv = ['node','cli.test.js', 'generate', ''];
    result = cli_parse.cli_parse();
    assert.equal(result.generate, 'config.yaml');
  });
  it ('handle non-string', function() {
    process.argv = ['node','cli.test.js', 'generate', 2.5];
    result = cli_parse.cli_parse();
    assert.equal(result.generate, 'config.yaml');
  });
});

describe('Verify CLI', function() {
  it ('verify filename', function() {
    process.argv = ['node','cli.test.js', 'verify', 'new.json'];
    result = cli_parse.cli_parse();
    assert.equal(result.verify, 'new.json');
  });
  it ('empty string goes to null', function() {
    process.argv = ['node','cli.test.js', 'verify', ''];
    result = cli_parse.cli_parse();
    assert.equal(result.verify, null);
  });
  it ('non-string goes to null', function() {
    process.argv = ['node','cli.test.js', 'verify', 0x1234];
    result = cli_parse.cli_parse();
    assert.equal(result.verify, null);
  });
});

describe('Encode CLI', function() {
  it ('simple', function() {
    process.argv = ['node','cli.test.js', 'encode', 'config.json', 'set', 'path/to/item', '--payload', '10'];
    result = cli_parse.cli_parse();
    assert.equal(result.encode, 'config.json');
    assert.equal(result.category, 'set');
    assert.equal(result.address, 'path/to/item');
    assert.equal(result.payload.toString(), ['10'].toString());
  });
  it ('multi-payload', function() {
    process.argv = ['node','cli.test.js', 'encode', 'config.json', 'set', 'path/to/item', '--payload', '10', '7aa2', '0000'];
    result = cli_parse.cli_parse();
    assert.equal(result.encode, 'config.json');
    assert.equal(result.category, 'set');
    assert.equal(result.address, 'path/to/item');
    assert.equal(result.payload.toString(), ['10', '7aa2', '0000'].toString());
  });
  it ('payload optional', function() {
    process.argv = ['node','cli.test.js', 'encode', 'config.json', 'set', 'path/to/item'];
    result = cli_parse.cli_parse();
    assert.equal(result.encode, 'config.json');
    assert.equal(result.category, 'set');
    assert.equal(result.address, 'path/to/item');
    assert.equal(result.payload, null);
  });
  it ('empty string goes to null', function() {
    process.argv = ['node','cli.test.js', 'encode', '', 'set', 'path'];
    result = cli_parse.cli_parse();
    assert.equal(result.encode, null);
  });
  it ('non-string goes to null', function() {
    process.argv = ['node','cli.test.js', 'encode', 0x1234, 'set', 'path'];
    result = cli_parse.cli_parse();
    assert.equal(result.encode, null);
  });
});

describe('Decode CLI', function() {
  it ('simple', function() {
    process.argv = ['node','cli.test.js', 'decode', 'config.json', 'A8000:1234:34:34'];
    result = cli_parse.cli_parse();
    assert.equal(result.decode, 'config.json');
    assert.equal(result.packet, 'A8000:1234:34:34');
  });
  it ('empty string goes to null', function() {
    process.argv = ['node','cli.test.js', 'decode', '', 'A8000:1234:34:34'];
    result = cli_parse.cli_parse();
    assert.equal(result.decode, null);
  });
  it ('non-string goes to null', function() {
    process.argv = ['node','cli.test.js', 'decode', 0x1234, 'A8000:1234:34:34'];
    result = cli_parse.cli_parse();
    assert.equal(result.decode, null);
  });
});
