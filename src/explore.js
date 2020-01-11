const protocolKey = require('./protocolKey.js');


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