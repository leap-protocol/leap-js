exports.ItemData = class ItemData {
  constructor(path = "", addr = "0000", data_branches=[], types=[]) {
    this.addr = addr;
    this.path = path;
    this.data_branches = data_branches;
    this.types = types;
  }
}