[![](https://github.com/leap-protocol/leap-js/workflows/L3aP-JS%20Testing/badge.svg)](https://github.com/leap-protocol/leap-js/)
<a href="https://codeclimate.com/github/leap-protocol/leap-js/maintainability"><img src="https://api.codeclimate.com/v1/badges/5af40fb63b711342f273/maintainability" /></a>

* [Specification documentation](https://leap-protocol.github.io/)

# L3aP for Javascript
Legible encoding for addressable packets for javascript

# Installation

`npm install leap-protocol`

# Basic Usage

Encoding a packet:
``` javascript
const fs = require(fs);
const leap = require('leap-protocol');

const config = JSON.parse(fs.readFileSync('leap-config.json'));
const codec = new leap.Codec(config);
const packet = new leap.Packet("set", "led/red", true);
const encoded = codec.encode(packet);

...
```

Decoding a packet:
``` javascript
const fs = require(fs);
const leap = require('leap-protocol');

const config = JSON.parse(fs.readFileSync('leap-config.json'));
const codec = new leap.Codec(config);

...
// Note: if there is a remainder it will be stored back in bytes
const [received, packets] = codec.decode(received);
const data = codec.unpack(packets[0]);

Object.keys(data).forEach(function (address) {
  // data[address] are the values in the unpacked data
  // address provides the full string path of data. e.g. led/red
  ...
});

```

# Usage

## Codec Class

### codec = Codec(config)
* **config** L3aP configuration object.
* **codec** L3aP codec object

Instantiates a L3aP codec object for encoding packets to strings and decoding strings to packets.

Example:
``` javascript
const config = yaml.parse(fs.readFileSync("leap-protocol.yaml"));
const codec = new leap.Codec(config);
```

### is_valid = valid()
* **is_valid** returns true or false

Determines whether the codec has a valid configuration. If the config is not valid,  the codec cannot be used.

Example:
``` javascript
...
const codec = new leap.Codec(config);
if (codec.valid()) {
  ...
}
```

### bytes = encode(packets)
* **packets** either a `leap.Packet` object or a list of `leap.packet` objects.
* **bytes** utf-8 byte string

Encodes one or more packets into a utf-8 byte string.

Example:
```javascript
const packet_red = new leap.Packet("set", "led/red", true);
const packet_blue = new leap.Packet("set", "led/blue", true);

encoded = codec.encode([packet_red, packet_blue]);
```

### (remainder, [packets]) = decode(bytes)
* **bytes** utf-8 encoded byte-string
* **remainder** unused bytes (if available)
* **packets** an array of one or more decoded packets, empty if none

Decodes a utf-8 byte string into one or more packets

Example:
```javascript
const received_bytes += rx.read();
const [received_bytes, packets] = codec.decode(received_bytes);

for (packet of packets) {
  ...
}
```

### data = unpack(packet)
* **packet** a `leap.Packet`
* **data** an object with address paths as keys (eg. `led/red`) mapping to thier respective values.

Extracts a dictionary from a packet to map address paths to thier respective values.

Example:
```javascript
if (packet.category === "set") {
  const commands = codec.unpack(packet);
  if ('led/red' in commands) {
    led_red.set(commands['led/red']);
    ...
  }
  ...
}
```

## Packet Class

### packet = Packet(category, *path*, *payload*)
* **category** the type of packet
* **path** (optional) a root path of payload data, set to null if not required
* **payload** (optional) the data to accompany the root path, set to null if not required
* **packet** a L3aP packet object

Constructs a L3aP packet for encoding.
*Note, payload can be an array and will set multiple fields at once when the path is a parent.*

Example:
```javascript
const accelerometer_packet = new leap.Packet("pub", "imu/accel", [accel_x, accel_y, accel_z]);
const disable_packet = new leap.Packet("set", "control/balance/disable");
...
```

### add(path, *payload*)
* **path** a root path of payload data
* **payload** (optional) the data to accompany the root path, set to null if not required

Adds path to the packet and optionally a payload.
This can be used to create compound packets which allows sets of data to be processed at the same time.

Example:
```javascript
const sensor_packet = new leap.Packet("pub", "imu/accel", [accel_x, accel_y, accel_z]);
sensor_packet.add("barometer/pressure", baro_pressure);
...
```

### category

The packet's category string.

Example:
```javascript
if (packet.category === "pub") {
  update_model(codec.unpack(packet));
}
...
```

### Accessing packet data

See the `codec.unpack(packet)` method above.

## Verification

### result = verify(config_file)
* **config_file** a L3aP config object
* **result** false if config is invalid, true otherwise

Checks the contents of a config object for errors. Prints details of the first failure to stdout. Useful for regression testing.

Example:
```javascript
...
function test_valid_config(self) {
  const config = yaml.parse(fs.readFileSync("../leap-protocol.yaml"));
  assert(leap.verify(config);
}
...
```

# Command Line

A command line tool is avaliable for L3aP:

`npm install leap-cli -g`

**Generate a default config file:**

`leap generate filename`

File names can have extension .yaml .json or .toml.

**Verify the contents of your config file:**

`leap verify configfile`

Files can have extension .yaml .json or .toml.

**Encode a packet based on a config file:**

`leap encode configfile category address --payload payload`

Example:
```sh
hoani@Hoani-CPU sandbox % leap encode config.yaml set item-1/child-1 1 --payload 10 1024.125
Encoded Packet ( set, item-1/child-1, [10,1024.125]):
S0001:0a:44800400
```

**Decode a packet based on a config file:**

`leap decode configfile packet`

Example:
```sh
hoani@Hoani-CPU sandbox % leap decode config.yaml S0001:0a:44800400
Decoded Packet <S0001:0a:44800400>:
   category - set
   address "item-1/child-1/grand-child-1" = 10
   address "item-1/child-1/grand-child-2" = 1024.125
```

Help:

`leap --help`

