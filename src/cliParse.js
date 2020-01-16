const arg_parse = require('argparse')

function configure_parser() {
  let parser = arg_parse.ArgumentParser();
  parser.addArgument(
    '--generate',
    {
      help: 'Generate an empty json, toml or yaml config file',
      defaultValue: null,
      metavar: 'filename',
      dest: 'generate'
    }
  );
  return parser;
}

exports.cli_parse = function cli_parse() {

  const parser = configure_parser();

  const args = parser.parseArgs()

  return args;
}

if (require.main === module) {
  settings = exports.cli_parse()

  console.log(settings)
}