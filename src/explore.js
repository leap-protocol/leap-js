const protocolKey = require('./protocolKey.js');


exports.count_depth = function count_depth(root) {
  let count = 0

  if (protocolKey.DATA in root) {
    const data = root[protocolKey.DATA]
    for (i in data) {
      const item = data[i]
      count += 1
      const name = Object.keys(item).pop();
      if (protocolKey.DATA in item[name]) {
        count += count_depth(item[name])
      }
    }
  }
  return count;
}


exports.count_to_path = function count_to_path(root, path) {
  let data;
  if ((protocolKey.DATA in root) == false) {
    return null;
  }
  else {
    data = root[protocolKey.DATA];
  }

  let count = 0;
  if (path == null) {
    return exports.count_depth(root)
  }
  const search = path[0];
  let found_path = false;

  for (i in data) {
    const item = data[i];
    // Expect only one key value pair per data item
    const name = Object.keys(item).pop();
    count += 1;
    if (name != search) {
      if (protocolKey.TYPE in item[name]) {
        continue;
      }
      else {
        count += exports.count_depth(item[name]);
      }
    }
    else {
      if (path.length > 1) {
        const deeper = path.slice(1, path.length);
        const incr = count_to_path(item[search], deeper);
        if (incr != null) {
          count += incr;
        }
        else {
          return null;
        }
      }
      found_path = true;
      break;
    }
  }
  if (found_path == false) {
    // search item was not found
    return null;
  }

  return count;
}


exports.get_struct = function get_struct(root, path) {
  if (path.length === 0) {
    return root;
  }

  if (protocolKey.DATA in root) {
    data = root[protocolKey.DATA];
  }
  else {
    return null;
  }

  for (let i in data) {
    let item = data[i];
    if (path[0] in item) {
      if (path.length == 1) {
        return item[path[0]];
      }
      else {
        const deeper = path.slice(1, path.length);
        return get_struct(item[path[0]], deeper);
      }
    }
  }

  return null;
}

exports.extract_types = function extract_types(root, path) {
  const start = exports.get_struct(root, path);
  const types = [];
  if (start != null) {
    if (protocolKey.TYPE in start) {
      types.push(start[protocolKey.TYPE]);
    }
    else if (protocolKey.DATA in start){
      for (let i in start[protocolKey.DATA]) {
        let item = start[protocolKey.DATA][i];
        const name = Object.keys(item).pop()
        types.push(
          ...extract_types(item[name], [])
        )
      }
    }
  }

  return types
}


