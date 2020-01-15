
const protocolKey = require('./protocolKey.js');
const dataVerifier = require('./configDataVerifier.js');


exports.ConfigVerifier = class ConfigVerifier {
  constructor() {
    this._data_verifier = new dataVerifier.DataVerifier()
    this._reset();
  }

  _reset() {
    this.section = "";
    this.failure = "";
    this._data_verifier.reset();
  }

  verify(config) {
    this._reset();

    if (config.length == 0) {
      this.section = "Config";
      this.print_failure = "Configuration is empty";
    }
    else if (this.verify_category(config) == false) {
      this.section = "Category";
    }
    else if (this.verify_version(config) == false) {
      this.section = "Version";
    }
    else if (this.verify_symbols(config) == false) {
      this.section = "Symbols";
    }
    else if (this._data_verifier.verify(config, "root") == false) {
      this.section = this._data_verifier.get_section();
      this.print_failure = this._data_verifier.get_failure();
    }
    else {
      return true;
    }

    return false;
  }

  print_failure() {
    if (this.section != "") {
      console.log("---");
      console.log("Config Verification Failed");
      console.log("");
      console.log(`Section: ${this.section}`);
      console.log(`Failure: ${this.failure}`);
      console.log("---");
    }
  }

  verify_symbols(config) {
    const symbols = ["separator", "compound", "end"];

    for (let i in symbols) {
      const symbol = symbols[i];
      if ((symbol in config) == false) {
        this.failure = `Missing ${symbol} key in root data structure`;
        return false;
      }

      if ((typeof config[symbol] === "string") == false) {
        this.failure = `${symbol} must be assigned to a single character e.g. ">"`;
        return false;
      }

      if (/^[\W]{1}$/.exec(config[symbol]) == null) {
        this.failure = `${symbol} must be a single character and non-alphanumeric e.g. ">"`;
        return false;
      }
    }

    if ((config['separator'] == config['compound']) ||
      (config['separator'] == config['end']) ||
      (config['compound'] == config['end'])
    ) {
      this.failure = '"separator", "compound" and "end" characters must all be different from eachother';
      return false;
    }
    return true;
  }


  verify_category(config) {
    if (("category" in config) == false) {
      this.failure = "Missing category key in root data structure";
      return false;
    }

    const category = config['category'];
    const keys = Object.keys(category);
    const values = Object.values(category);

    if (keys.length == 0) {
      this.failure = 'There must be at least one category item';
      return false;
    }

    for (let i in keys) {
      const key = keys[i];
      if (/^[A-Za-z]/.exec(key) == null) {
        this.failure = "Category keys must be strings";
        return false;
      }

      if (/^[A-Za-z0-9\-_]+$/.exec(key) == null) {
        this.failure = "Category keys may only contain alphanumeric symbols, underscores(_) and dashes (-)";
        return false;
      }
    }


    for (let i in values) {
      const value = values[i];
      if ((typeof value === "string") == false) {
        this.failure = 'A category must be assigned to a single capital letter e.g. "C"';
        return false;
      }

      if (/^[A-Z]{1}$/.exec(value) == null) {
        this.failure = 'A category must be assigned to a single capital letter e.g. "C"';
        return false;
      }
    }

    return true;
  }


  verify_version(config) {
    if (("version" in config) == false) {
      this.failure = "Missing version key in root data structure";
    }
    else {
      const version = config["version"];
      const keys = Object.keys(version);
      const segments = ["major", "minor", "patch"];

      for (let i in segments) {
        const segment = segments[i];
        if ((segment in version) == false) {
          this.failure = `Missing "${segment}" in "version" data structure`;
          break;
        }

        if (Number.isInteger(version[segment]) == false) {
          this.failure = `"version" "${segment}" must be an integer`;
          break;
        }
      }

      if (keys.length != 3) {
        this.failure = '"version" must only contain items "major", "minor" and "patch"';
      }
    }

    return (this.failure === "");
  }
}

