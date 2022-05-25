const fs = require('fs')

exports.exitsFolder = function (dirPath) {
  fs.stat(dirPath, function (err, stats) {
    if (!stats) {
      fs.mkdir(dirPath, {recursive: true}, err => {
        if (err) throw err;
      });
    }
  });
}
