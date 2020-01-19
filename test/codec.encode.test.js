const utf8 = require('utf8');
const assert = require('assert');
const codec = require('../src/codec.js');
const packet = require('../src/packet.js');
const loadConfig = require('../src/loadConfig.js');

function load_config(filename) {
  const loader = new loadConfig.LoadConfig(filename);
  return loader.config();
}

describe('AckPacketEncode', function() {
  beforeEach(function() {
    this.codec = new codec.Codec(load_config("test/fake/protocol.json"));
  });
  it('ack_encoding', function() {
    expected = utf8.encode("A8000\n");
    _packet = new packet.Packet("ack", "control");
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('nack_encoding', function() {
    expected = utf8.encode("N8000\n");
    _packet = new packet.Packet("nak", "control");
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('nack_compound', function() {
    expected = utf8.encode("N8000|1200\n");
    _packet = new packet.Packet("nak", "control");
    _packet.add("imu");
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
});

describe('GetPacketEncode', function() {
  beforeEach(function() {
    this.codec = new codec.Codec(load_config("test/fake/protocol.json"));
  });
  it('simple_encoding', function() {
    expected = utf8.encode("G0000\n");
    _packet = new packet.Packet("get", "protocol");
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('invalid_address', function() {
    expected = utf8.encode("");
    _packet = new packet.Packet("get", "protocol/invalid");
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('nested_encoding', function() {
    expected = utf8.encode("G0004\n");
    _packet = new packet.Packet("get", "protocol/version/patch");
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('can_pass_array', function() {
    expected = utf8.encode("G0004\n");
    _packet = new packet.Packet("get", "protocol/version/patch");
    result = this.codec.encode([_packet]);
    assert.equal(result, expected);
  });
  it('compound_packets', function() {
    expected = utf8.encode("G0003\nG0004\n");
    packets = [
      new packet.Packet("get", "protocol/version/minor"),
      new packet.Packet("get", "protocol/version/patch"),
    ]
    result = this.codec.encode(packets);
    assert.equal(result, expected);
  });
  it('compound_mixed_packets', function() {
    expected = utf8.encode("G1201\nB0005\nS2002:0\nG0003\nP0004:1234\n");
    packets = [
      new packet.Packet("get", "imu/accel"),
      new packet.Packet("sub", "protocol/name"),
      new packet.Packet("set", "typecheck/boolean", false),
      new packet.Packet("get", "protocol/version/minor"),
      new packet.Packet("pub", "protocol/version/patch", 0x1234),
    ]
    result = this.codec.encode(packets);
    assert.equal(result, expected);
  });
});

describe('PacketCompoundEncode', function() {
  beforeEach(function() {
    this.codec = new codec.Codec(load_config("test/fake/protocol.json"));
  });
  it('compound_encoding', function() {
    expected = utf8.encode("G0000|8000\n");
    _packet = new packet.Packet("get", "protocol");
    _packet.add("control");
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('compound_multipacket_encoding', function() {
    expected = utf8.encode("G0000|8000\nS8000|0000\n");
    packets = [
      new packet.Packet("get", "protocol"),
      new packet.Packet("set", "control"),
    ]
    packets[0].add("control");
    packets[1].add("protocol");
    result = this.codec.encode(packets);
    assert.equal(result, expected);
  });
});

describe('SetPacketEncodeMultiple', function() {
  beforeEach(function() {
    this.codec = new codec.Codec(load_config("test/fake/protocol.json"));
  });
  it('sequential', function() {
    expected = utf8.encode("S0001:12:34:0567\n");
    _packet = new packet.Packet("set", "protocol/version", [0x12, 0x34, 0x567]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('non_sequential', function() {
    expected = utf8.encode("S0000:12:34:0567:486f616e69\n");
    _packet = new packet.Packet("set", "protocol", [0x12, 0x34, 0x567, "Hoani"]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('ignores_unused_payload_items', function() {
    expected = utf8.encode("S0001:12:34:0567\n");
    _packet = new packet.Packet("set", "protocol/version", [0x12, 0x34, 0x567]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('ignores_unused_sequential_items', function() {
    expected = utf8.encode("S0001:12:34\n");
    _packet = new packet.Packet("set", "protocol/version", [0x12, 0x34]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
});

describe('SetPacketEncodeSingle', function() {
  beforeEach(function() {
    this.codec = new codec.Codec(load_config("test/fake/protocol.json"));
  });
  it('simple_string', function() {
    expected = utf8.encode("S2001:486f616e69277320537472696e67\n");
    _packet = new packet.Packet("set", "typecheck/string", ["Hoani's String"]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('simple_bool', function() {
    expected = utf8.encode("S2002:1\n");
    _packet = new packet.Packet("set", "typecheck/boolean", [true]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('simple_u8', function() {
    expected = utf8.encode("S2003:a5\n");
    _packet = new packet.Packet("set", "typecheck/uint8", [0xa5]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('bigint u8', function() {
    expected = utf8.encode("S2003:ab\n");
    _packet = new packet.Packet("set", "typecheck/uint8", [0xabn]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('invalid u8', function() {
    expected = utf8.encode("S2003:\n");
    _packet = new packet.Packet("set", "typecheck/uint8", ["invalid"]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('underflow_u8', function() {
    expected = utf8.encode("S2003:00\n");
    _packet = new packet.Packet("set", "typecheck/uint8", [-0xa5]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('overflow_u8', function() {
    expected = utf8.encode("S2003:ff\n");
    _packet = new packet.Packet("set", "typecheck/uint8", [0x1a5]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('simple_u16', function() {
    expected = utf8.encode("S2004:0234\n");
    _packet = new packet.Packet("set", "typecheck/uint16", [0x0234]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('bigint u16', function() {
    expected = utf8.encode("S2004:0237\n");
    _packet = new packet.Packet("set", "typecheck/uint16", [0x0237n]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('underflow_u16', function() {
    expected = utf8.encode("S2004:0000\n");
    _packet = new packet.Packet("set", "typecheck/uint16", [-0x0234]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('overflow_u16', function() {
    expected = utf8.encode("S2004:ffff\n");
    _packet = new packet.Packet("set", "typecheck/uint16", [0x10234]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('simple_u32', function() {
    expected = utf8.encode("S2005:00102234\n");
    _packet = new packet.Packet("set", "typecheck/uint32", [0x102234]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('bigint u32', function() {
    expected = utf8.encode("S2005:00102239\n");
    _packet = new packet.Packet("set", "typecheck/uint32", [0x102239n]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('underflow_u32', function() {
    expected = utf8.encode("S2005:00000000\n");
    _packet = new packet.Packet("set", "typecheck/uint32", [-0x102234]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('overflow_u32', function() {
    expected = utf8.encode("S2005:ffffffff\n");
    _packet = new packet.Packet("set", "typecheck/uint32", [0x100002234]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('small u64', function() {
    expected = utf8.encode("S2006:0000000000102234\n");
    _packet = new packet.Packet("set", "typecheck/uint64", [0x102234]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('simple_u64', function() {
    expected = utf8.encode("S2006:0010223400000078\n");
    _packet = new packet.Packet("set", "typecheck/uint64", [0x10223400000078n]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('underflow_u64', function() {
    expected = utf8.encode("S2006:0000000000000000\n");
    _packet = new packet.Packet("set", "typecheck/uint64", [-0x10223400000078n]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('overflow_u64', function() {
    expected = utf8.encode("S2006:ffffffffffffffff\n");
    _packet = new packet.Packet("set", "typecheck/uint64", [0x10000010223400000078n]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('simple_i8', function() {
    expected = utf8.encode("S2007:11\n");
    _packet = new packet.Packet("set", "typecheck/int8", [0x11]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('bigint i8', function() {
    expected = utf8.encode("S2007:16\n");
    _packet = new packet.Packet("set", "typecheck/int8", [0x16n]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('negative_i8', function() {
    expected = utf8.encode("S2007:ef\n");
    _packet = new packet.Packet("set", "typecheck/int8", [-0x11]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('overflow_i8', function() {
    expected = utf8.encode("S2007:7f\n");
    _packet = new packet.Packet("set", "typecheck/int8", [0x1FF]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('underflow_i8', function() {
    expected = utf8.encode("S2007:80\n");
    _packet = new packet.Packet("set", "typecheck/int8", [-0x1FF]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('bigint i16', function() {
    expected = utf8.encode("S2008:0434\n");
    _packet = new packet.Packet("set", "typecheck/int16", [0x0434n]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('simple_i16', function() {
    expected = utf8.encode("S2008:0234\n");
    _packet = new packet.Packet("set", "typecheck/int16", [0x0234]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('signed_i16', function() {
    expected = utf8.encode("S2008:fdcc\n");
    _packet = new packet.Packet("set", "typecheck/int16", [-0x0234]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('overflow_i16', function() {
    expected = utf8.encode("S2008:7fff\n");
    _packet = new packet.Packet("set", "typecheck/int16", [0x1ffff]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('underflow_i16', function() {
    expected = utf8.encode("S2008:8000\n");
    _packet = new packet.Packet("set", "typecheck/int16", [-0x1FF00]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('bigint i32', function() {
    expected = utf8.encode("S2009:00152234\n");
    _packet = new packet.Packet("set", "typecheck/int32", [0x152234n]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('simple_i32', function() {
    expected = utf8.encode("S2009:00102234\n");
    _packet = new packet.Packet("set", "typecheck/int32", [0x102234]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('signed_i32', function() {
    expected = utf8.encode("S2009:ffefddcc\n");
    _packet = new packet.Packet("set", "typecheck/int32", [-0x102234]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('overflow_i32', function() {
    expected = utf8.encode("S2009:7fffffff\n");
    _packet = new packet.Packet("set", "typecheck/int32", [0x1fffffffff]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('underflow_i32', function() {
    expected = utf8.encode("S2009:80000000\n");
    _packet = new packet.Packet("set", "typecheck/int32", [-0x1FF0000000]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('small i64', function() {
    expected = utf8.encode("S200a:0000000000102234\n");
    _packet = new packet.Packet("set", "typecheck/int64", [0x102234]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('simple_i64', function() {
    expected = utf8.encode("S200a:0010223400000078\n");
    _packet = new packet.Packet("set", "typecheck/int64", [0x10223400000078n]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('signed_i64', function() {
    expected = utf8.encode("S200a:ffefddcbffffff88\n");
    _packet = new packet.Packet("set", "typecheck/int64", [-0x10223400000078n]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('overflow_i64', function() {
    expected = utf8.encode("S200a:7fffffffffffffff\n");
    _packet = new packet.Packet("set", "typecheck/int64", [0x1ffffffffffffffff0n]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('underflow_i64', function() {
    expected = utf8.encode("S200a:8000000000000000\n");
    _packet = new packet.Packet("set", "typecheck/int64", [-0x1FF000000000000000n]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('float', function() {
    expected = utf8.encode("S200b:60dc9cc9\n");
    _packet = new packet.Packet("set", "typecheck/float", [1.2717441261e+20]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('float invalid', function() {
    expected = utf8.encode("S200b:\n");
    _packet = new packet.Packet("set", "typecheck/float", [{value: "100()00"}]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('double', function() {
    expected = utf8.encode("S200c:3ff3c083126e978d\n");
    _packet = new packet.Packet("set", "typecheck/double", [1.2344999999999999307]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('double invalid', function() {
    expected = utf8.encode("S200c:\n");
    _packet = new packet.Packet("set", "typecheck/double", ["not a double"]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('enum', function() {
    expected = utf8.encode("S200d:02\n");
    _packet = new packet.Packet("set", "typecheck/enum", ["item_3"]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('enum_invalid', function() {
    expected = utf8.encode("S200d:\n");
    _packet = new packet.Packet("set", "typecheck/enum", ["invalid"]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
  it('enum_none', function() {
    expected = utf8.encode("S200e:\n");
    _packet = new packet.Packet("set", "typecheck/none", ["unneccesary"]);
    result = this.codec.encode(_packet);
    assert.equal(result, expected);
  });
});

