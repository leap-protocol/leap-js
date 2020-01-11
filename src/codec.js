const fs = require('fs');


exports.Codec = class Codec {
  constructor(filepath) {
    let data;
    this.valid = false;
    this.encode_map = {};
    this.decode_map = {};

    try {
      data = fs.readFileSync(filepath);
      this.valid = true;
    }
    catch (err) {
      this.valid = false;
      console.log("invlaid file");
    }


    if (this.valid) {
      const protocol = JSON.parse(data);
      // console.log(`read ${data}`);
      // console.log(protocol);
      this._generate_maps(protocol["data"])
    }
  }

  _generate_maps(data) {
    this.encode_map = {
      a:1,
      b:1,
      c:1,
      d:1,
      e:1,
      f:1,
      g:1,
      h:1,
    }
    // for (let name in Object.keys(data)) {
    //   this.encode_map[name] = 1;
    //   for (let key in data[name]):
    //     if
    // };
  }

}
