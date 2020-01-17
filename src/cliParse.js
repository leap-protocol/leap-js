const arg_parse = require('argparse')

function configure_parser() {
  let parser = arg_parse.ArgumentParser();
  parser.addArgument(
    '--generate',
    {
      help: 'Generate an empty yaml, json, or toml config file',
      defaultValue: null,
      metavar: 'filename',
      dest: 'generate'
    }
  );
  parser.addArgument(
    '--validate',
    {
      help: '',
      defaultValue: null,
      metavar: 'filename',
      dest: 'validate'
    }
  );
  return parser;
}

function args_to_settings(args) {
  const default_generate_suffix = ".yaml";
  const default_generate_name = "config";

  if (args.generate != null) {
    if (args.generate === '') {
      args.generate = default_generate_name;
    }
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