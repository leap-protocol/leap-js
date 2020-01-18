![](https://github.com/leap-protocol/leap-js/workflows/L3aP-JS%20Testing/badge.svg)
<a href="https://codeclimate.com/github/leap-protocol/leap-js/maintainability"><img src="https://api.codeclimate.com/v1/badges/5af40fb63b711342f273/maintainability" /></a>

# L3aP for Javascript
Legible encoding for addressable packets for javascript

Specification documentation:
https://leap-protocol.github.io/

# Installation

`npm install leap-protocol`

# Basic Usage

Encoding a packet:
``` javascript
const leap = require('leap-protocol');

const codec = new leap.Codec("leap-config.json");
const packet = new leap.Packet("set", "led/red", true);
const encoded = codec.encode(packet);

...
```

Decoding a packet:
``` javascript
const leap = require('leap-protocol');

const codec = leap.Codec("leap-config.json")

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

### codec = Codec(config_file_path)
* **config_file_path** a string to point to the L3aP config file.
* **codec** L3aP codec object

Instantiates a L3aP codec object for encoding packets to strings and decoding strings to packets.

Example:
``` javascript
const codec = new leap.Codec("leap-config.json");
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
* **config_file** a valid L3aP config file
* **result** false if config_file is invalid, true otherwise

Checks the contents of a config_file for errors. Prints details of the first failure to stdout. Useful for regression testing.

Example:
```javascript
...
function test_valid_config(self) {
  assert(leap.verify("leap-config.json"));
}
...
```

# Command Line

**Generate a default config file:**

`node node_modules/.bin/leap generate filename`

File names can have extension .yaml .json or .toml.

**Verify the contents of your config file:**

`node node_modules/.bin/leap verify configfile`

Files can have extension .yaml .json or .toml.

**Encode a packet based on a config file:**

`node node_modules/.bin/leap encode configfile category address payload`

Example:
```sh
hoani@Hoani-CPU sandbox % node cli.js encode config.json set item-1/child-1 10 1024.125
TODO
```

**Decode a packet based on a config file:**

`node node_modules/.bin/leap decode configfile packet`

Example:
```sh
hoani@Hoani-CPU sandbox % node cli.js decode config.json S8000:0a:????????
TODO
```

Help:

`node node_modules/.bin/leap --help`

