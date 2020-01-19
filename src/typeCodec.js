// Copyright © 2020 Hoani Bryson
// License: MIT (https://mit-license.org/)
//
// Type codec
//
// Methods for encoding and decoding individual data items
//


exports.encode_types = function encode_types(item, type) {
  try {
    let value;
    if (type == "u8") {
      if ((item instanceof BigInt) == false) {
        item = BigInt(item);
      }
      value = clamp(item, BigInt(0x00), BigInt(0xff));
      return to_padded_hex_string(value, 2);
    }
    else if (type == "u16") {
      if ((item instanceof BigInt) == false) {
        item = BigInt(item);
      }
      value = clamp(item, BigInt(0x0000), BigInt(0xffff));
      return to_padded_hex_string(value, 4);
    }
    else if (type == "u32") {
      if ((item instanceof BigInt) == false) {
        item = BigInt(item);
      }
      value = clamp(item, BigInt(0x00000000), BigInt(0xffffffff));
      return to_padded_hex_string(value, 8);
    }
    else if (type == "u64") {
      if ((item instanceof BigInt) == false) {
        item = BigInt(item);
      }
      value = clamp(item, BigInt("0x0000000000000000"), BigInt("0xffffffffffffffff"));
      return to_padded_hex_string(value, 16);
    }
    else if (type == "i8") {
      if ((item instanceof BigInt) == false) {
        item = BigInt(item);
      }
      value = clamp(item, BigInt(-0x80), BigInt(0x7F));
      value = (value < BigInt(0)) ? (value + BigInt(0x100)): (value);
      return to_padded_hex_string(value, 2);
    }
    else if (type == "i16") {
      if ((item instanceof BigInt) == false) {
        item = BigInt(item);
      }
      value = clamp(item, BigInt(-0x8000), BigInt(0x7FFF));
      value = (value < BigInt(0)) ? (value + BigInt(0x10000)): (value);
      return to_padded_hex_string(value, 4);
    }
    else if (type == "i32") {
      if ((item instanceof BigInt) == false) {
        item = BigInt(item);
      }
      value = clamp(item, BigInt(-0x80000000), BigInt(0x7FFFFFFF));
      value = (value < BigInt(0)) ? (value + BigInt(0x100000000)): (value);
      return to_padded_hex_string(value, 8);
    }
    else if (type == "i64") {
      if ((item instanceof BigInt) == false) {
        item = BigInt(item);
      }
      value = clamp(item, -BigInt("0x8000000000000000"), BigInt("0x7FFFFFFFFFFFFFFF"));
      value = (value < BigInt(0)) ? (value + BigInt("0x10000000000000000")): (value);
      return to_padded_hex_string(value, 16);
    }
    else if (type == "string") {
      value = "";
      for (let i in item) {
        value += item.charCodeAt(i).toString(16);
      }
      return value;
    }
    else if (type == "bool") {
      return (item == true) ? ("1") : ("0");
    }
    else if (type == "float") {
      item = Number(item);
      if (Number.isNaN(item)) {
        return "";
      }
      const view = new DataView(new ArrayBuffer(4));
      view.setFloat32(0, item);
      value = view.getInt32(0);
      return to_padded_hex_string(value, 8);
    }
    else if (type == "double") {
      item = Number(item);
      if (Number.isNaN(item)) {
        return "";
      }
      const view = new DataView(new ArrayBuffer(8));
      view.setFloat64(0, item);
      value = view.getInt32(0);
      let str1 = to_padded_hex_string(value, 8);
      value = view.getInt32(4);
      return str1 + to_padded_hex_string(value, 8);
    }
    else if (typeof type == "object") {
      if (type.includes(item)) {
        value = type.indexOf(item);
        if (value != undefined) {
          return to_padded_hex_string(value, 2);
        }
      }
      return "";
    }
  }
  catch {
    return "";
  }
  return "";
}

function decode_unsigned(item, bits) {
  try {
    return clamp(BigInt("0x" + item), BigInt(0), (BigInt(0x1) << bits) - BigInt(1));
  }
  catch (e){
    const default_value = BigInt(0);
    return default_value;
  }
}

function decode_signed(item, bits) {
  try {
    let value = BigInt("0x" + item);
    let min_value = BigInt(0x1) << (bits - BigInt(1))
    if (value > min_value) {
      value -= BigInt(0x1) << (bits);
    }

    return clamp(value, -min_value, min_value - BigInt(1))
  }
  catch {
    const default_value = BigInt(0);
    return (default_value);
  }
}

exports.decode_types = function decode_types(item, type) {
  try {
    let value;
    if (type == "u8") {
      return decode_unsigned(item, BigInt(8));
    }
    else if (type == "u16") {
      return decode_unsigned(item, BigInt(16));
    }
    else if (type == "u32") {
      return decode_unsigned(item, BigInt(32));
    }
    else if (type == "u64") {
      return decode_unsigned(item, BigInt(64));
    }
    else if (type == "i8") {
      return decode_signed(item, BigInt(8));
    }
    else if (type == "i16") {
      return decode_signed(item, BigInt(16));
    }
    else if (type == "i32") {
      return decode_signed(item, BigInt(32));
    }
    else if (type == "i64") {
      return decode_signed(item, BigInt(64));
    }
    else if (type == "string") {
      value = "";
      for (let i = 0; i< item.length; i+=2) {
        const char_code = Number("0x" + item.slice(i, i+2));
        value += String.fromCharCode(char_code);
      }
      return value;
    }
    else if (type == "bool") {
      return (item == "1") ? (true) : (false);
    }
    else if (type == "float") {
      const view = new DataView(new ArrayBuffer(4));
      view.setInt32(0, Number(BigInt("0x"+item)));
      value = view.getFloat32(0);
      return value;
    }
    else if (type == "double") {
      const view = new DataView(new ArrayBuffer(8));
      view.setInt32(0, Number(BigInt("0x"+item.slice(0, 8))));
      view.setInt32(4, Number(BigInt("0x"+item.slice(8, 16))));
      value = view.getFloat64(0);
      return value;
    }
    else if (typeof type == "object") {
      value = decode_unsigned(item, BigInt(8));
      if (value < type.length) {
        return type[value];
      }
    }
  }
  catch (err) {
    console.log(`Decode error: ${err}`)
    return null;
  }
  return null;
}

function clamp(value, min_value, max_value) {
  if (value > max_value) {
    return max_value;
  }
  if (value < min_value) {
    return min_value;
  }
  return value;
}

function to_padded_hex_string(ivalue, zeropads) {
  return ("0".repeat(zeropads) + ivalue.toString(16)).substr(-zeropads);
}


