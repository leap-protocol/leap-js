// const assert = require('assert');
// const codec = require('../src/codec.js');


// describe('GetPacketDecode', function() {
//   beforeEach(function() {
//     this.codec = new codec.Codec("test/fake/protocol.json");  });
//   it('simple_decoding', function() {
//     expected = packet.Packet("get", "protocol");
//     (_, [result]) = this.codec.decode("G0000\n".encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths)
//   });
//   it('remainder', function() {
//     expected = "S10".encode('utf-8');
//     (result, packets) = this.codec.decode("G0000\nS10".encode('utf-8'));
//     assert.equal(result, expected);
//     assert.equal(len(packets), 1)
//   });
//   it('incomplete', function() {
//     expected = "S10".encode('utf-8');
//     (result, packets) = this.codec.decode("S10".encode('utf-8'));
//     assert.equal(result, expected);
//     assert.equal(len(packets), 0)
//   });
//   it('nested_decoding', function() {
//     expected = packet.Packet("get", "protocol/version/patch");
//     (_, [result]) = this.codec.decode("G0004\n".encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths)
//   });
//   it('deep_nest_decoding', function() {
//     expected = packet.Packet("get", "control/pid/setpoint/value");
//     (_, [result]) = this.codec.decode("G800e\n".encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths)
//   });
//   it('ack_category', function() {
//     expected = packet.Packet("ack", "control");
//     (_, [result]) = this.codec.decode("A8000\n".encode('utf-8'));
//     assert.equal(result.category, expected.category)
//   });
//   it('nack_category', function() {
//     expected = packet.Packet("nak", "control");
//     (_, [result]) = this.codec.decode("N8000\n".encode('utf-8'));
//     assert.equal(result.category, expected.category)
//   });
//   it('simple_payload_decoding', function() {
//     expected = packet.Packet("get", "protocol/version/major", tuple([0x11]));
//     (_, [result]) = this.codec.decode("G0002:11\n".encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads)
//   });
//   it('multi_payload_decoding', function() {
//     expected = packet.Packet("get", "protocol/version", tuple([0x11, 0x22, 0x3344]));
//     (_, [result]) = this.codec.decode("G0001:11:22:3344\n".encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
// });

// describe('DecodeCompoundPackets', function() {
//   beforeEach(function() {
//     this.codec = new codec.Codec("test/fake/protocol.json");
//   });
//   it('compound_decoding', function() {
//     expected = packet.Packet("get", "protocol");
//     expected.add("protocol/version");
//     (_, result) = this.codec.decode("G0000|0001\n".encode('utf-8'));
//     assert.equal(len(result), 1);
//     assert.equal(result[0].category, expected.category);
//     assert.equal(result[0].paths, expected.paths)
//   });
//   it('compound_with_payloads_decoding', function() {
//     expected = packet.Packet("set", "protocol", (0x11, 0x22, 0x33));
//     expected.add("protocol/version", 0x44);
//     (_, result) = this.codec.decode("S0000:11:22:33|0001:44\n".encode('utf-8'));
//     assert.equal(len(result), 1);
//     assert.equal(result[0].category, expected.category);
//     assert.equal(result[0].paths, expected.paths);
//     assert.equal(result[0].payloads, expected.payloads)
//   });
//   it('multipacket_compound_decoding', function() {
//     expected = [
//       packet.Packet("get", "protocol"),
//       packet.Packet("sub", "control")
//     ];
//     expected[0].add("protocol/version");
//     expected[1].add("imu/accel");
//     (_, result) = this.codec.decode("G0000|0001\nB8000|1201\n".encode('utf-8'));
//     assert.equal(len(result), 2);
//     assert.equal(result[0].category, expected[0].category);
//     assert.equal(result[0].paths   , expected[0].paths);
//     assert.equal(result[1].category, expected[1].category);
//     assert.equal(result[1].paths   , expected[1].paths);
//   });
// });

// describe('SetPayloadDecodeMultiple', function() {
//   beforeEach(function() {
//     this.codec = new codec.Codec("test/fake/protocol.json");
//   });
//   it('sequential', function() {
//     expected = packet.Packet("set", "protocol/version", tuple([0x12, 0x34, 0x567]));
//     (_, [result]) = this.codec.decode(("S0001:12:34:0567\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
//   it('non_sequential', function() {
//     expected = packet.Packet("set", "protocol", tuple([0x12, 0x34, 0x567, "Hoani"]));
//     (_, [result]) = this.codec.decode(("S0000:12:34:0567:Hoani\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
//   it('ignores_unused_payload_items', function() {
//     expected = packet.Packet("set", "protocol/version", tuple([0x12, 0x34, 0x567]));
//     (_, [result]) = this.codec.decode(("S0001:12:34:0567\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
//   it('ignores_unused_sequential_items', function() {
//     expected = packet.Packet("set", "protocol/version", tuple([0x12, 0x34]));
//     (_, [result]) = this.codec.decode(("S0001:12:34\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
// });


// describe('SetPayloadDecodeSingle', function() {
//   beforeEach(function() {
//     this.codec = new codec.Codec("test/fake/protocol.json");
//   });
//   it('simple_string', function() {
//     expected = packet.Packet("set", "typecheck/string", tuple(["Hoani's String"]));
//     (_, [result]) = this.codec.decode(("S2001:Hoani's String\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
//   it('simple_bool', function() {
//     expected = packet.Packet("set", "typecheck/boolean", tuple([True]));
//     (_, [result]) = this.codec.decode(("S2002:1\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
//   it('simple_u8', function() {
//     expected = packet.Packet("set", "typecheck/uint8", tuple([0xa5]));
//     (_, [result]) = this.codec.decode(("S2003:a5\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
//   it('underflow_u8', function() {
//     expected = packet.Packet("set", "typecheck/uint8", tuple([0x00]));
//     (_, [result]) = this.codec.decode(("S2003:-e3\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
//   it('overflow_u8', function() {
//     expected = packet.Packet("set", "typecheck/uint8", tuple([0xff]));
//     (_, [result]) = this.codec.decode(("S2003:1a5\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
//   it('simple_u16', function() {
//     expected = packet.Packet("set", "typecheck/uint16", tuple([0x0234]));
//     (_, [result]) = this.codec.decode(("S2004:0234\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
//   it('underflow_u16', function() {
//     expected = packet.Packet("set", "typecheck/uint16", tuple([0x0000]));
//     (_, [result]) = this.codec.decode(("S2004:-0234\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
//   it('overflow_u16', function() {
//     expected = packet.Packet("set", "typecheck/uint16", tuple([0xffff]));
//     (_, [result]) = this.codec.decode(("S2004:1ffff\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
//   it('simple_u32', function() {
//     expected = packet.Packet("set", "typecheck/uint32", tuple([0x102234]));
//     (_, [result]) = this.codec.decode(("S2005:00102234\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
//   it('underflow_u32', function() {
//     expected = packet.Packet("set", "typecheck/uint32", tuple([0x00000000]));
//     (_, [result]) = this.codec.decode(("S2005:-00102234\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
//   it('overflow_u32', function() {
//     expected = packet.Packet("set", "typecheck/uint32", tuple([0xffffffff]));
//     (_, [result]) = this.codec.decode(("S2005:100002234\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
//   it('simple_u64', function() {
//     expected = packet.Packet("set", "typecheck/uint64", tuple([0x10223400000078]));
//     (_, [result]) = this.codec.decode(("S2006:0010223400000078\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
//   it('underflow_u64', function() {
//     expected = packet.Packet("set", "typecheck/uint64", tuple([0x0]));
//     (_, [result]) = this.codec.decode(("S2006:-10223400000078\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
//   it('overflow_u64', function() {
//     expected = packet.Packet("set", "typecheck/uint64", tuple([0xffffffffffffffff]));
//     (_, [result]) = this.codec.decode(("S2006:10000010223400000078\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
//   it('simple_i8', function() {
//     expected = packet.Packet("set", "typecheck/int8", tuple([0x11]));
//     (_, [result]) = this.codec.decode(("S2007:11\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
//   it('negative_i8', function() {
//     expected = packet.Packet("set", "typecheck/int8", tuple([-0x11]));
//     (_, [result]) = this.codec.decode(("S2007:ef\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
//   it('simple_i16', function() {
//     expected = packet.Packet("set", "typecheck/int16", tuple([0x0234]));
//     (_, [result]) = this.codec.decode(("S2008:0234\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
//   it('signed_i16', function() {
//     expected = packet.Packet("set", "typecheck/int16", tuple([-0x0234]));
//     (_, [result]) = this.codec.decode(("S2008:fdcc\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
//   it('simple_i32', function() {
//     expected = packet.Packet("set", "typecheck/int32", tuple([0x102234]));
//     (_, [result]) = this.codec.decode(("S2009:00102234\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
//   it('signed_i32', function() {
//     expected = packet.Packet("set", "typecheck/int32", tuple([-0x102234]));
//     (_, [result]) = this.codec.decode(("S2009:ffefddcc\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
//   it('simple_i64', function() {
//     expected = packet.Packet("set", "typecheck/int64", tuple([0x10223400000078]));
//     (_, [result]) = this.codec.decode(("S200a:0010223400000078\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
//   it('signed_i64', function() {
//     expected = packet.Packet("set", "typecheck/int64", tuple([-0x10223400000078]));
//     (_, [result]) = this.codec.decode(("S200a:ffefddcbffffff88\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
//   it('float', function() {
//     expected = packet.Packet("set", "typecheck/float", tuple([1.2717441261e+20]));
//     (_, [result]) = this.codec.decode(("S200b:60dc9cc9\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(abs(result.payloads[0][0] - expected.payloads[0][0]) < 0.00001e+20);
//   });
//   it('double', function() {
//     expected = packet.Packet("set", "typecheck/double", tuple([1.2344999999999999307]));
//     (_, [result]) = this.codec.decode(("S200c:3ff3c083126e978d\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(abs(result.payloads[0][0] - expected.payloads[0][0]) < 0.0000001 );
//   });
//   it('enum', function() {
//     expected = packet.Packet("set", "typecheck/enum", tuple(["item_2"]));
//     (_, [result]) = this.codec.decode(("S200d:01\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
//   it('enum_invalid', function() {
//     expected = packet.Packet("set", "typecheck/enum", tuple([None]));
//     (_, [result]) = this.codec.decode(("S200d:05\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
//   it('none', function() {
//     expected = packet.Packet("set", "typecheck/none", tuple([None]));
//     (_, [result]) = this.codec.decode(("S200e:\n").encode('utf-8'));
//     assert.equal(result.category, expected.category);
//     assert.equal(result.paths, expected.paths);
//     assert.equal(result.payloads, expected.payloads);
//   });
// });
