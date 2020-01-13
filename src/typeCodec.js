


exports.encode_types = function encode_types(item, type) {
  let value;
  if (type == "u8") {
    value = clamp(item, 0x00, 0xff);
    return to_padded_hex_string(value, 2);
  }
  else if (type == "u16") {
    value = clamp(item, 0x0000, 0xffff);
    return to_padded_hex_string(value, 4);
  }
  else if (type == "u32") {
    value = clamp(item, 0x00000000, 0xffffffff);
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
    value = clamp(item, -0x80, 0x7F);
    value = (value < 0) ? (value + 0x100): (value);
    return to_padded_hex_string(value, 2);
  }
  else if (type == "i16") {
    value = clamp(item, -0x8000, 0x7FFF);
    value = (value < 0) ? (value + 0x10000): (value);
    return to_padded_hex_string(value, 4);
  }
  else if (type == "i32") {
    value = clamp(item, -0x80000000, 0x7FFFFFFF);
    value = (value < 0) ? (value + 0x100000000): (value);
    return to_padded_hex_string(value, 8);
  }
  else if (type == "i64") {
    if ((item instanceof BigInt) == false) {
      item = BigInt(item);
    }
    value = clamp(item, -0x8000000000000000n, 0x7FFFFFFFFFFFFFFFn);
    value = (value < 0) ? (value + 0x10000000000000000n): (value);
    return to_padded_hex_string(value, 16);
  }
  else if (type == "string") {
    return item;
  }
  else if (type == "bool") {
    return (item == true) ? ("1") : ("0");
  }
  else if (type == "float") {
    const view = new DataView(new ArrayBuffer(4));
    view.setFloat32(0, item);
    value = view.getInt32(0);
    return to_padded_hex_string(value, 8);
  }
  else if (type == "double") {
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
  else {
    return "";
  }
}

// function decode_unsigned(item, bits) {
//   try {
//     return clamp(int(item, 16), 0, (0x1 << bits) - 1);
//   }
//   catch {
//     return 0;
//   }
// }

// function decode_signed(item, bits) {
//   try {
//     value = int(item, 16)
//     min_value = 0x1 << (bits - 1)
//     if (value > min_value) {
//       value -= 0x1 << (bits);
//     }

//     return clamp(value, -min_value, min_value -1)
//   }
//   catch {
//     return 0;
//   }
// }

exports.decode_types = function decode_types(item, type) {
  return "";
}
//   if (type == "u8") {
//     return decode_unsigned(item, 8);
//   }
//   else if (type == "u16") {
//     return decode_unsigned(item, 16);
//   }
//   else if (type == "u32") {
//     return decode_unsigned(item, 32);
//   }
//   else if (type == "u64") {
//     return decode_unsigned(item, 64);
//   }
//   else if (type == "i8") {
//     return decode_signed(item, 8);
//   }
//   else if (type == "i16") {
//     return decode_signed(item, 16);
//   }
//   else if (type == "i32") {
//     return decode_signed(item, 32);
//   }
//   else if (type == "i64") {
//     return decode_signed(item,64);
//   }
//   else if (type == "string") {
//     return item;
//   }
//   else if (type == "bool") {
//     return true if item == "1" else false;
//   }
//   else if (type == "float") {
//     [x] = struct.unpack('>f', bytearray.fromhex(item));
//     return x;
//   }
//   else if (type == "double") {
//     [x] = struct.unpack('>d', bytearray.fromhex(item));
//     return x;
//   }
//   else if (typeof type is Object) {
//     x = decode_unsigned(item, 8);
//     if (x < type.length) {
//       return type[x]
//     }
//     return null;
//   }

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

function to_addr_int(svalue) {
  return parseInt(svalue, 16);
}

