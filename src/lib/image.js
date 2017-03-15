var Jimp = require("jimp");
var _ = require("lodash");

var Image = function (options) {

    this.options = options || {};
    this.width = this.options.width;
    this.height = this.options.height;

};

module.exports = Image;

Image.prototype.draw = function (tiles) {

  return new Promise (function(resolve, reject) {

    var key = 0;

    var image = new Jimp(this.width, this.height, function (err, image) {

      if (err) reject(err);

      this.image = image;

      tiles.forEach(function (data) {

        Jimp.read(data.body, function (err, tile) {

            if (err) reject(err);

            var x = data.box[0];
            var y = data.box[1];

            var sx = x < 0 ? 0 : x;
            var sy = y < 0 ? 0 : y;

            var dx = x < 0 ? -x : 0;
            var dy = y < 0 ? -y : 0;

            var extraWidth = x + tile.bitmap.width - this.width;
            var extraHeight = y + tile.bitmap.width - this.height;

            var w = tile.bitmap.width + (x < 0 ? x : 0) - (extraWidth > 0 ? extraWidth : 0);
            var h = tile.bitmap.height + (y < 0 ? y : 0) - (extraHeight > 0 ? extraHeight : 0);

            image.blit(tile, sx, sy, dx, dy, w, h);
            this.image = image;

            if (key === tiles.length-1) resolve(true);
            key++;

        }.bind(this));
      },this);
    }.bind(this));
  }.bind(this));

};

/**
 * Save image to file
 */
Image.prototype.save = function (fileName, cb) {

  if (_.isFunction(cb)) {
    this.image.write(fileName, cb);
  } else {

    return new Promise(function(resolve, reject) {
        this.image.write(fileName, function () {
          resolve();
        });
    }.bind(this));

  }
};
/**
 * Return image as buffer
 */
Image.prototype.buffer = function (mime, cb) {

  if (_.isFunction(cb)) {
    this.image.getBuffer(mime, cb);
  } else {
    return new Promise(function(resolve, reject) {
      this.image.getBuffer(mime, function (err,result) {
        if (err) reject (err);
        else resolve(result);
      });
    }.bind(this));
  }

};