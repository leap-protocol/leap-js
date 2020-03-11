// Copyright © 2020 Hoani Bryson
// License: MIT (https://mit-license.org/)
//
// Type codec
//
// Methods for encoding and decoding individual data items
//

function integer_validity_check(item) {
  if (typeof item != "number") {
    throw "Invalid input"
  }
}

exports.encode_types = function encode_types(item, type) {
  try {
    let value;
    if (type == "u8") {
      integer_validity_check(item);
      value = clamp(item, 0x00, 0xff);
      return to_padded_hex_string(value, 2);
    }
    else if (type == "u16") {
      integer_validity_check(item);
      value = clamp(item, 0x0000, 0xffff);
      return to_padded_hex_string(value, 4);
    }
    else if (type == "u32") {
      integer_validity_check(item);
      value = clamp(item, 0x0000_0000, 0xffff_ffff);
      return to_padded_hex_string(value, 8);
    }
    else if (type == "i8") {
      integer_validity_check(item);
      value = clamp(item, -0x80, 0x7F);
      value = (value < 0) ? (value + 0x100) : (value);
      return to_padded_hex_string(value, 2);
    }
    else if (type == "i16") {
      integer_validity_check(item);
      value = clamp(item, -0x8000, 0x7FFF);
      value = (value < 0) ? (value + 0x1_0000) : (value);
      return to_padded_hex_string(value, 4);
    }
    else if (type == "i32") {
      integer_validity_check(item);
      value = clamp(item, -0x8000_0000, 0x7FFF_FFFF);
      value = (value < 0) ? (value + 0x1_0000_0000) : (value);
      return to_padded_hex_string(value, 8);
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

function decode_unsigned(item, maxValue) {
  let reHex = /^[\dA-Fa-f]{1,}$/;

  if (reHex.test(item) == true) {
    let value = parseInt(item, 16);
    if (typeof value == "number") {
      return clamp(value, 0, maxValue);
    }
  }
  const default_value = 0;
  return default_value;
}

function decode_signed(item, capacity) {
  let reHex = /^[\dA-Fa-f]{1,}$/;

  if (reHex.test(item) == true) {
    let value = parseInt(item, 16);
    if (typeof value == "number") {
      let maxValue = capacity/2 - 1;
      let minValue = -capacity/2;
      if (value > maxValue) {
        value -= capacity;
      }
      return clamp(value, minValue, maxValue)
    }
  }

  const default_value = 0;
  return (default_value);
}

exports.decode_types = function decode_types(item, type) {
  try {
    let value;
    if (type == "u8") {
      return decode_unsigned(item, 0xff);
    }
    else if (type == "u16") {
      return decode_unsigned(item, 0xffff);
    }
    else if (type == "u32") {
      return decode_unsigned(item, 0xffff_ffff);
    }
    else if (type == "i8") {
      return decode_signed(item, 0x100);
    }
    else if (type == "i16") {
      return decode_signed(item, 0x1_0000);
    }
    else if (type == "i32") {
      return decode_signed(item, 0x1_0000_0000);
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
      let reHex = /^[\dA-Fa-f]{1,}$/;

      if (reHex.test(item) == true) {
        const view = new DataView(new ArrayBuffer(4));
        view.setInt32(0, parseInt(item, 16));
        value = view.getFloat32(0);
        return value;
      }
    }
    else if (type == "double") {
      let reHex = /^[\dA-Fa-f]{1,}$/;

      if (reHex.test(item) == true) {
        const view = new DataView(new ArrayBuffer(8));
        view.setInt32(0, parseInt(item.slice(0, 8), 16));
        view.setInt32(4, parseInt(item.slice(8, 16), 16));
        value = view.getFloat64(0);
        return value;
      }
    }
    else if (typeof type == "object") {
      value = decode_unsigned(item, 0xff);
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


