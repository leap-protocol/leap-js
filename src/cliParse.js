// Copyright © 2020 Hoani Bryson
// License: MIT (https://mit-license.org/)
//
// Cli Parse
//
// Parses command line input and returns settings
//

const arg_parse = require('argparse')

function add_command_generate(subparsers) {
  const supparser = subparsers.addParser(
    'generate',
    {
      addHelp:true,
      help: "Generate an empty yaml, json, or toml config file"
    }
  );
  supparser.addArgument(
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
  const supparser = subparsers.addParser(
    'verify',
    {
      addHelp:true,
      help: "Verify the correctness of a L3aP configuration file"
    }
  );
  supparser.addArgument(
    'verify',
    {
      help: 'Config filename',
      defaultValue: null,
      metavar: 'filename'
    }
  );
}

function args_to_settings_verify(args) {
  if (args.verify == '' || (typeof args.verify !== 'string')) {
    args.verify = null;
  }
}

function add_command_encode(subparsers) {
  const supparser = subparsers.addParser(
    'encode',
    {
      addHelp:true,
      help: "Encode a packet using a L3aP configuration file"
    }
  );
  supparser.addArgument(
    'encode',
    {
      help: 'Config filename',
      metavar: 'filename'
    }
  );
  supparser.addArgument(
    'category',
    {
      help: 'Packet category, e.g. set, get, pub...',
    }
  );
  supparser.addArgument(
    'address',
    {
      help: 'Path of the data item to be addresses',
    }
  );
  supparser.addArgument(
    '--payload',
    {
      help: 'Value(s) of payload items to be added',
      nargs: "+"
    }
  );
}

function args_to_settings_encode(args) {
  if (args.encode == '' || (typeof args.encode !== 'string')) {
    args.encode = null;
  }
}

function add_command_decode(subparsers) {
  const supparser = subparsers.addParser(
    'decode',
    {
      addHelp:true,
      help: "Decode a packet using a L3aP configuration file"
    }
  );
  supparser.addArgument(
    'decode',
    {
      help: 'Config filename',
      metavar: 'filename'
    }
  );
  supparser.addArgument(
    'packet',
    {
      help: 'String to decode',
    }
  );
}

function args_to_settings_decode(args) {
  if (args.decode == '' || (typeof args.decode !== 'string')) {
    args.decode = null;
  }
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

