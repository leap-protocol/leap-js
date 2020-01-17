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

function args_to_settings(args) {
  const default_generate_suffix = ".yaml";

  if (args.generate != null) {
    if (/(.yaml|.json|.toml)$/.exec(args.generate) == null) {
      args.generate += default_generate_suffix;
    }
  }

  return args;
}

exports.cli_parse = function cli_parse() {

  const parser = configure_parser();

  const args = parser.parseArgs();

  const settings = args_to_settings(args);

  return settings;
}

if (require.main === module) {
  settings = exports.cli_parse()

  console.log(settings)
}