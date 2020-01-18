// Copyright © 2020 Hoani Bryson
// License: MIT (https://mit-license.org/)
//
// Cli Parse
//
// Parses command line input and returns settings
//

const arg_parse = require('argparse')

function filter_non_string(value) {
  if (value == '' || (typeof value !== 'string')) {
    return null;
  }
  return value;
}

function new_subparser(subparsers, name, help) {
  const subparser = subparsers.addParser(
    name,
    {
      addHelp: true,
      help
    }
  );
  return subparser
}

function add_command_generate(subparsers) {
  const subparser = new_subparser(
    subparsers,
    'generate',
    "Generate an empty yaml, json, or toml config file"
  );
  subparser.addArgument(
    'generate',
    {
      help: 'Name for the generated file',
      defaultValue: null,
      metavar: 'filename'
    }
  );
}

function args_to_settings_generate(args) {
  const default_generate_suffix = ".yaml";
  const default_generate_name = "config";

  if (args.generate === '' || (typeof args.generate !== "string")) {
    args.generate = default_generate_name;
  }
  if (/(.yaml|.json|.toml)$/.exec(args.generate) == null) {
    args.generate += default_generate_suffix;
  }
}

function add_command_verify(subparsers) {
  const subparser = new_subparser(
    subparsers,
    'verify',
    "Verify the correctness of a L3aP configuration file"
  );
  subparser.addArgument(
    'verify',
    {
      help: 'Config filename',
      defaultValue: null,
      metavar: 'filename'
    }
  );
}

function args_to_settings_verify(args) {
  args.verify = filter_non_string(args.verify);
}

function add_command_encode(subparsers) {
  const subparser = new_subparser(
    subparsers,
    'encode',
    "Encode a packet using a L3aP configuration file"
  );
  subparser.addArgument(
    'encode',
    {
      help: 'Config filename',
      metavar: 'filename'
    }
  );
  subparser.addArgument(
    'category',
    {
      help: 'Packet category, e.g. set, get, pub...',
    }
  );
  subparser.addArgument(
    'address',
    {
      help: 'Path of the data item to be addresses',
    }
  );
  subparser.addArgument(
    '--payload',
    {
      help: 'Value(s) of payload items to be added',
      nargs: "+"
    }
  );
}

function args_to_settings_encode(args) {
  args.encode = filter_non_string(args.encode);
}

function add_command_decode(subparsers) {
  const subparser = new_subparser(
    subparsers,
    'decode',
    "Decode a packet using a L3aP configuration file"
  );
  subparser.addArgument(
    'decode',
    {
      help: 'Config filename',
      metavar: 'filename'
    }
  );
  subparser.addArgument(
    'packet',
    {
      help: 'String to decode',
    }
  );
}

function args_to_settings_decode(args) {
  args.decode = filter_non_string(args.decode);
}

function configure_parser() {
  let parser = arg_parse.ArgumentParser({addHelp:true});

  var subparsers = parser.addSubparsers({title:'Commands'});

  add_command_generate(subparsers);
  add_command_verify(subparsers);
  add_command_encode(subparsers);
  add_command_decode(subparsers);

  return parser;
}

function args_to_settings(args) {

  if ("generate" in args) {
    args_to_settings_generate(args);
  }

  if ('verify' in args) {
    args_to_settings_verify(args);
  }

  if ('encode' in args) {
    args_to_settings_encode(args);
  }

  if ('decode' in args) {
    args_to_settings_decode(args);
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

