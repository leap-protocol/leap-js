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
      value = clamp(item, 0x00n, 0xffn);
      return to_padded_hex_string(value, 2);
    }
    else if (type == "u16") {
      if ((item instanceof BigInt) == false) {
        item = BigInt(item);
      }
      value = clamp(item, 0x0000n, 0xffffn);
      return to_padded_hex_string(value, 4);
    }
    else if (type == "u32") {
      if ((item instanceof BigInt) == false) {
        item = BigInt(item);
      }
      value = clamp(item, 0x00000000n, 0xffffffffn);
      return to_padded_hex_string(value, 8);
    }
    else if (type == "u64") {
      if ((item instanceof BigInt) == false) {
        item = BigInt(item);
      }
      value = clamp(item, 0x0000000000000000n, 0xffffffffffffffffn);
      return to_padded_hex_string(value, 16);
    }
    else if (type == "i8") {
      if ((item instanceof BigInt) == false) {
        item = BigInt(item);
      }
      value = clamp(item, -0x80n, 0x7Fn);
      value = (value < 0n) ? (value + 0x100n): (value);
      return to_padded_hex_string(value, 2);
    }
    else if (type == "i16") {
      if ((item instanceof BigInt) == false) {
        item = BigInt(item);
      }
      value = clamp(item, -0x8000n, 0x7FFFn);
      value = (value < 0n) ? (value + 0x10000n): (value);
      return to_padded_hex_string(value, 4);
    }
    else if (type == "i32") {
      if ((item instanceof BigInt) == false) {
        item = BigInt(item);
      }
      value = clamp(item, -0x80000000n, 0x7FFFFFFFn);
      value = (value < 0n) ? (value + 0x100000000n): (value);
      return to_padded_hex_string(value, 8);
    }
    else if (type == "i64") {
      if ((item instanceof BigInt) == false) {
        item = BigInt(item);
      }
      value = clamp(item, -0x8000000000000000n, 0x7FFFFFFFFFFFFFFFn);
      value = (value < 0n) ? (value + 0x10000000000000000n): (value);
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
      if (typeof item != "number") {
        return "";
      }
      const view = new DataView(new ArrayBuffer(4));
      view.setFloat32(0, item);
      value = view.getInt32(0);
      return to_padded_hex_string(value, 8);
    }
    else if (type == "double") {
      if (typeof item != "number") {
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
    return clamp(BigInt("0x" + item), 0n, (0x1n << bits) - 1n);
  }
  catch (e){
    const default_value = 0n;
    return default_value;
  }
}

function decode_signed(item, bits) {
  try {
    let value = BigInt("0x" + item);
    let min_value = 0x1n << (bits - 1n)
    if (value > min_value) {
      value -= 0x1n << (bits);
    }

    return clamp(value, -min_value, min_value - 1n)
  }
  catch {
    const default_value = 0n;
    return (default_value);
  }
}

exports.decode_types = function decode_types(item, type) {
  try {
    let value;
    if (type == "u8") {
      return decode_unsigned(item, 8n);
    }
    else if (type == "u16") {
      return decode_unsigned(item, 16n);
    }
    else if (type == "u32") {
      return decode_unsigned(item, 32n);
    }
    else if (type == "u64") {
      return decode_unsigned(item, 64n);
    }
    else if (type == "i8") {
      return decode_signed(item, 8n);
    }
    else if (type == "i16") {
      return decode_signed(item, 16n);
    }
    else if (type == "i32") {
      return decode_signed(item, 32n);
    }
    else if (type == "i64") {
      return decode_signed(item, 64n);
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
      value = decode_unsigned(item, 8n);
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


