// const assert = require('assert');
// const codec = require('../src/codec.js');


// describe('AckPacketEncode', function() {
//   beforeEach(function() {
//     this.codec = new codec.Codec("test/fake/protocol.json");
//   });
//   it('ack_encoding', function() {
//     expected = ("A8000\n").encode('utf-8');
//     _packet = packet.Packet("ack", "control");
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('nack_encoding', function() {
//     expected = ("N8000\n").encode('utf-8');
//     _packet = packet.Packet("nak", "control");
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('nack_compound', function() {
//     expected = ("N8000|1200\n").encode('utf-8');
//     _packet = packet.Packet("nak", "control");
//     _packet.add("imu");
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
// });

// describe('GetPacketEncode', function() {
//   beforeEach(function() {
//     this.codec = new codec.Codec("test/fake/protocol.json");
//   });
//   it('simple_encoding', function() {
//     expected = ("G0000\n").encode('utf-8');
//     _packet = packet.Packet("get", "protocol");
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('invalid_address', function() {
//     expected = ("").encode('utf-8');
//     _packet = packet.Packet("get", "protocol/invalid");
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('nested_encoding', function() {
//     expected = ("G0004\n").encode('utf-8');
//     _packet = packet.Packet("get", "protocol/version/patch");
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('can_pass_array', function() {
//     expected = ("G0004\n").encode('utf-8');
//     _packet = packet.Packet("get", "protocol/version/patch");
//     result = this.codec.encode([_packet]);
//     assert.equal(result, expected);
//   });
//   it('compound_packets', function() {
//     expected = ("G0003\nG0004\n").encode('utf-8');
//     packets = [
//       packet.Packet("get", "protocol/version/minor"),
//       packet.Packet("get", "protocol/version/patch");
//     ]
//     result = this.codec.encode(packets);
//     assert.equal(result, expected);
//   });
//   it('compound_mixed_packets', function() {
//     expected = ("G1201\nB0005\nS2002:0\nG0003\nP0004:1234\n").encode('utf-8');
//     packets = [
//       packet.Packet("get", "imu/accel"),
//       packet.Packet("sub", "protocol/name"),
//       packet.Packet("set", "typecheck/boolean", False),
//       packet.Packet("get", "protocol/version/minor"),
//       packet.Packet("pub", "protocol/version/patch", 0x1234);
//     ]
//     result = this.codec.encode(packets);
//     assert.equal(result, expected);
//   });
// });

// describe('PacketCompoundEncode', function() {
//   beforeEach(function() {
//     this.codec = new codec.Codec("test/fake/protocol.json");
//   });
//   it('compound_encoding', function() {
//     expected = ("G0000|8000\n").encode('utf-8');
//     _packet = packet.Packet("get", "protocol");
//     _packet.add("control");
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('compound_multipacket_encoding', function() {
//     expected = ("G0000|8000\nS8000|0000\n").encode('utf-8');
//     packets = [
//       packet.Packet("get", "protocol"),
//       packet.Packet("set", "control");
//     ]
//     packets[0].add("control");
//     packets[1].add("protocol");
//     result = this.codec.encode(packets);
//     assert.equal(result, expected);
//   });
// });

// describe('SetPacketEncodeMultiple', function() {
//   beforeEach(function() {
//     this.codec = new codec.Codec("test/fake/protocol.json");
//   });
//   it('sequential', function() {
//     expected = ("S0001:12:34:0567\n").encode('utf-8');
//     _packet = packet.Packet("set", "protocol/version", tuple([0x12, 0x34, 0x567]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('non_sequential', function() {
//     expected = ("S0000:12:34:0567:Hoani\n").encode('utf-8');
//     _packet = packet.Packet("set", "protocol", tuple([0x12, 0x34, 0x567, "Hoani"]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('ignores_unused_payload_items', function() {
//     expected = ("S0001:12:34:0567\n").encode('utf-8');
//     _packet = packet.Packet("set", "protocol/version", tuple([0x12, 0x34, 0x567]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('ignores_unused_sequential_items', function() {
//     expected = ("S0001:12:34\n").encode('utf-8');
//     _packet = packet.Packet("set", "protocol/version", tuple([0x12, 0x34]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
// });

// describe('SetPacketEncodeSingle', function() {
//   beforeEach(function() {
//     this.codec = new codec.Codec("test/fake/protocol.json");
//   });
//   it('simple_string', function() {
//     expected = ("S2001:Hoani's String\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/string", tuple(["Hoani's String"]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('simple_bool', function() {
//     expected = ("S2002:1\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/boolean", tuple([True]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('simple_u8', function() {
//     expected = ("S2003:a5\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/uint8", tuple([0xa5]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('underflow_u8', function() {
//     expected = ("S2003:00\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/uint8", tuple([-0xa5]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('overflow_u8', function() {
//     expected = ("S2003:ff\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/uint8", tuple([0x1a5]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('simple_u16', function() {
//     expected = ("S2004:0234\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/uint16", tuple([0x0234]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('underflow_u16', function() {
//     expected = ("S2004:0000\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/uint16", tuple([-0x0234]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('overflow_u16', function() {
//     expected = ("S2004:ffff\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/uint16", tuple([0x10234]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('simple_u32', function() {
//     expected = ("S2005:00102234\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/uint32", tuple([0x102234]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('underflow_u32', function() {
//     expected = ("S2005:00000000\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/uint32", tuple([-0x102234]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('overflow_u32', function() {
//     expected = ("S2005:ffffffff\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/uint32", tuple([0x100002234]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('simple_u64', function() {
//     expected = ("S2006:0010223400000078\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/uint64", tuple([0x10223400000078]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('underflow_u64', function() {
//     expected = ("S2006:0000000000000000\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/uint64", tuple([-0x10223400000078]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('overflow_u64', function() {
//     expected = ("S2006:ffffffffffffffff\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/uint64", tuple([0x10000010223400000078]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('simple_i8', function() {
//     expected = ("S2007:11\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/int8", tuple([0x11]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('negative_i8', function() {
//     expected = ("S2007:ef\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/int8", tuple([-0x11]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('overflow_i8', function() {
//     expected = ("S2007:7f\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/int8", tuple([0x1FF]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('underflow_i8', function() {
//     expected = ("S2007:80\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/int8", tuple([-0x1FF]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('simple_i16', function() {
//     expected = ("S2008:0234\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/int16", tuple([0x0234]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('signed_i16', function() {
//     expected = ("S2008:fdcc\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/int16", tuple([-0x0234]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('overflow_i16', function() {
//     expected = ("S2008:7fff\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/int16", tuple([0x1ffff]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('underflow_i16', function() {
//     expected = ("S2008:8000\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/int16", tuple([-0x1FF00]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('simple_i32', function() {
//     expected = ("S2009:00102234\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/int32", tuple([0x102234]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('signed_i32', function() {
//     expected = ("S2009:ffefddcc\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/int32", tuple([-0x102234]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('overflow_i32', function() {
//     expected = ("S2009:7fffffff\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/int32", tuple([0x1fffffffff]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('underflow_i32', function() {
//     expected = ("S2009:80000000\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/int32", tuple([-0x1FF0000000]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('simple_i64', function() {
//     expected = ("S200a:0010223400000078\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/int64", tuple([0x10223400000078]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('signed_i64', function() {
//     expected = ("S200a:ffefddcbffffff88\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/int64", tuple([-0x10223400000078]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('overflow_i64', function() {
//     expected = ("S200a:7fffffffffffffff\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/int64", tuple([0x1ffffffffffffffff0]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('underflow_i64', function() {
//     expected = ("S200a:8000000000000000\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/int64", tuple([-0x1FF000000000000000]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('float', function() {
//     expected = ("S200b:60dc9cc9\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/float", tuple([1.2717441261e+20]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('double', function() {
//     expected = ("S200c:3ff3c083126e978d\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/double", tuple([1.2344999999999999307]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('enum', function() {
//     expected = ("S200d:02\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/enum", tuple(["item_3"]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('enum_invalid', function() {
//     expected = ("S200d:\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/enum", tuple(["invalid"]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
//   it('enum_none', function() {
//     expected = ("S200e:\n").encode('utf-8');
//     _packet = packet.Packet("set", "typecheck/none", tuple(["unneccesary"]));
//     result = this.codec.encode(_packet);
//     assert.equal(result, expected);
//   });
// });

